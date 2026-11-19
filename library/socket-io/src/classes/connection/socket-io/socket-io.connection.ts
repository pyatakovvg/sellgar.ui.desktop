import { io, type Socket } from 'socket.io-client';
import { parseRealtimeDelivery, type RealtimeDelivery } from '../../protocol/realtime-delivery.ts';

import type {
  SocketIOConnectionError,
  SocketIOConnectionHandler,
  SocketIOConnectionInterface,
  SocketIOConnectionOptions,
  SocketIOConnectionRequestOptions,
  SocketIOConnectionSubscription,
  SocketIOConnectionSubscriptionOptions,
  SocketIODeliverySubscription,
  SocketIORealtimeDeliveryHandler,
} from '../../service/socket-io-connections/socket-io-connections.interface.ts';

const RECONNECT_DELAYS = [0, 2_000, 10_000, 30_000, 60_000] as const;
const CONNECTION_STABLE_AFTER_MS = 30_000;
const DELIVERY_EVENT = 'realtime.event.v1';
const DELIVERY_ACK_EVENT = 'realtime.ack.v1';
const DELIVERY_READY_EVENT = 'realtime.ready.v1';
const DELIVERY_SUBSCRIPTION_CONTEXT_EVENT = 'realtime.subscription.context.v1';
const DELIVERY_SUBSCRIPTION_DISPOSE_EVENT = 'realtime.subscription.dispose.v1';
const DELIVERY_ACK_TIMEOUT_MS = 5_000;

interface SocketIOSubscriber {
  readonly handler: SocketIOConnectionHandler;
  readonly onError?: SocketIOConnectionSubscriptionOptions['onError'];
}

interface SocketIOEventSubscribers {
  readonly dispatcher: SocketIOConnectionHandler;
  readonly subscribers: Set<SocketIOSubscriber>;
}

interface SocketIODeliverySubscriber {
  context?: object;
  contextRevision: number;
  readonly eventType: string;
  readonly handler: SocketIORealtimeDeliveryHandler;
  readonly onError?: SocketIOConnectionSubscriptionOptions['onError'];
  readonly subscriptionId: string;
}

export class SocketIOConnection implements SocketIOConnectionInterface {
  private readonly socket: Socket;
  private readonly events = new Map<string, SocketIOEventSubscribers>();
  private readonly deliverySubscribers = new Set<SocketIODeliverySubscriber>();
  private deliveryExecution = Promise.resolve();
  private deliveryGeneration = 0;
  private deliverySubscriptionSequence = 0;
  private deliverySubscription: SocketIOConnectionSubscription | undefined;
  private retryAttempt = 0;
  private retryTimer: ReturnType<typeof setTimeout> | undefined;
  private stableConnectionTimer: ReturnType<typeof setTimeout> | undefined;
  private subscriberCount = 0;
  private connectedOnce = false;
  private disposed = false;

  constructor(url: string, options: SocketIOConnectionOptions = {}) {
    this.socket = io(url, {
      ...options,
      autoConnect: false,
    });
    this.socket.on('connect', this.handleConnect);
    this.socket.on('connect_error', this.handleConnectError);
    this.socket.on('disconnect', this.handleDisconnect);
    this.socket.on(DELIVERY_READY_EVENT, this.handleDeliveryReady);
    this.socket.io.on('reconnect_error', this.handleReconnectError);
    this.socket.io.on('reconnect_failed', this.handleReconnectFailed);
  }

  reconnect(): void {
    this.assertActive();
    this.clearRetry();
    this.clearStableConnectionTimer();
    this.disconnect();
    this.scheduleRetry();
  }

  subscribeDelivery<TPayload = unknown, TContext extends object = Record<string, unknown>>(
    eventType: string,
    handler: SocketIORealtimeDeliveryHandler<TPayload>,
    options: SocketIOConnectionSubscriptionOptions = {},
  ): SocketIODeliverySubscription<TContext> {
    this.assertActive();

    const subscriber: SocketIODeliverySubscriber = {
      contextRevision: 0,
      eventType,
      handler: handler as SocketIORealtimeDeliveryHandler,
      onError: options.onError,
      subscriptionId: String(++this.deliverySubscriptionSequence),
    };

    this.deliverySubscribers.add(subscriber);
    this.deliverySubscription ??= this.subscribe(DELIVERY_EVENT, (payload: unknown) => this.dispatchDelivery(payload));

    let active = true;

    return {
      dispose: async () => {
        if (!active) {
          return;
        }

        active = false;

        if (this.socket.connected && subscriber.context !== undefined) {
          this.socket.emit(DELIVERY_SUBSCRIPTION_DISPOSE_EVENT, {
            subscriptionId: subscriber.subscriptionId,
          });
        }

        this.deliverySubscribers.delete(subscriber);

        if (this.deliverySubscribers.size === 0) {
          const subscription = this.deliverySubscription;

          this.deliverySubscription = undefined;
          await subscription?.dispose();
        }
      },
      updateContext: (context: TContext) => {
        if (!active) {
          throw new Error('Socket.IO delivery subscription уже освобождена.');
        }

        subscriber.context = context;
        subscriber.contextRevision += 1;

        if (this.socket.connected) {
          this.emitDeliverySubscriptionContext(subscriber);
        }
      },
    };
  }

  subscribe<TArguments extends unknown[]>(
    event: string,
    handler: SocketIOConnectionHandler<TArguments>,
    options: SocketIOConnectionSubscriptionOptions = {},
  ): SocketIOConnectionSubscription {
    this.assertActive();

    const eventSubscribers = this.getOrCreateEventSubscribers(event);
    const subscriber: SocketIOSubscriber = {
      handler: handler as SocketIOConnectionHandler,
      onError: options.onError,
    };

    eventSubscribers.subscribers.add(subscriber);
    this.subscriberCount += 1;
    this.applyDesiredState();

    let active = true;

    return {
      dispose: async () => {
        if (!active) {
          return;
        }

        active = false;
        this.releaseSubscriber(event, subscriber);
        this.applyDesiredState();
      },
    };
  }

  request<Payload, Response>(
    event: string,
    payload: Payload,
    options: SocketIOConnectionRequestOptions = {},
  ): Promise<Response> {
    this.assertActive();

    const socket = options.timeoutMs === undefined ? this.socket : this.socket.timeout(options.timeoutMs);

    return socket.emitWithAck(event, payload) as Promise<Response>;
  }

  async dispose(): Promise<void> {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.clearRetry();
    this.clearStableConnectionTimer();

    for (const [event, eventSubscribers] of this.events) {
      this.socket.off(event, eventSubscribers.dispatcher);
    }

    this.events.clear();
    this.deliverySubscribers.clear();
    this.deliverySubscription = undefined;
    this.subscriberCount = 0;
    this.socket.off('connect', this.handleConnect);
    this.socket.off('connect_error', this.handleConnectError);
    this.socket.off('disconnect', this.handleDisconnect);
    this.socket.off(DELIVERY_READY_EVENT, this.handleDeliveryReady);
    this.socket.io.off('reconnect_error', this.handleReconnectError);
    this.socket.io.off('reconnect_failed', this.handleReconnectFailed);
    this.disconnect();
  }

  private readonly handleConnect = () => {
    this.connectedOnce = true;
    this.clearRetry();
    this.clearStableConnectionTimer();
    this.synchronizeDeliverySubscriptionContexts();
    this.stableConnectionTimer = setTimeout(() => {
      this.stableConnectionTimer = undefined;

      if (this.socket.connected) {
        this.retryAttempt = 0;
      }
    }, CONNECTION_STABLE_AFTER_MS);
  };

  private readonly handleDeliveryReady = () => {
    this.clearStableConnectionTimer();
    this.retryAttempt = 0;
  };

  private readonly handleConnectError = (error: unknown) => {
    this.reportError({
      context: this.connectedOnce ? 'reconnect' : 'start',
      error,
    });

    if (!this.socket.active) {
      this.scheduleRetry();
    }
  };

  private readonly handleDisconnect = (reason: string) => {
    this.clearStableConnectionTimer();

    if (!this.hasSubscribers || this.socket.active || reason === 'io client disconnect') {
      return;
    }

    this.reportError({
      context: 'reconnect',
      error: new Error(`Socket.IO connection disconnected: ${reason}`),
    });
    this.scheduleRetry();
  };

  private readonly handleReconnectError = (error: unknown) => {
    this.reportError({ context: 'reconnect', error });
  };

  private readonly handleReconnectFailed = () => {
    this.reportError({
      context: 'reconnect',
      error: new Error('Socket.IO reconnect attempts exhausted.'),
    });
    this.scheduleRetry();
  };

  private get hasSubscribers(): boolean {
    return !this.disposed && this.subscriberCount > 0;
  }

  private getOrCreateEventSubscribers(event: string): SocketIOEventSubscribers {
    const eventSubscribers = this.events.get(event);

    if (eventSubscribers) {
      return eventSubscribers;
    }

    const subscribers = new Set<SocketIOSubscriber>();
    const dispatcher: SocketIOConnectionHandler = (...arguments_) => {
      for (const subscriber of [...subscribers]) {
        void Promise.resolve()
          .then(() => subscriber.handler(...arguments_))
          .catch((error: unknown) => {
            this.reportSubscriberError(subscriber, {
              context: 'handler',
              error,
              event,
            });
          });
      }
    };
    const createdEventSubscribers: SocketIOEventSubscribers = {
      dispatcher,
      subscribers,
    };

    this.events.set(event, createdEventSubscribers);
    this.socket.on(event, dispatcher);

    return createdEventSubscribers;
  }

  private releaseSubscriber(event: string, subscriber: SocketIOSubscriber): void {
    const eventSubscribers = this.events.get(event);

    if (!eventSubscribers?.subscribers.delete(subscriber)) {
      return;
    }

    this.subscriberCount -= 1;

    if (eventSubscribers.subscribers.size > 0) {
      return;
    }

    this.events.delete(event);
    this.socket.off(event, eventSubscribers.dispatcher);
  }

  private dispatchDelivery(payload: unknown): Promise<void> {
    const deliveryGeneration = this.deliveryGeneration;

    this.deliveryExecution = this.deliveryExecution
      .catch(() => undefined)
      .then(async () => {
        if (deliveryGeneration !== this.deliveryGeneration) {
          return;
        }

        let delivery: RealtimeDelivery | undefined;

        try {
          const parsedDelivery = parseRealtimeDelivery(payload);

          delivery = parsedDelivery;
          const subscribers = [...this.deliverySubscribers].filter(
            (subscriber) => subscriber.eventType === parsedDelivery.eventType,
          );

          await Promise.all(
            subscribers.map((subscriber) => subscriber.handler(parsedDelivery.payload, parsedDelivery)),
          );
          await this.request(
            DELIVERY_ACK_EVENT,
            {
              sequence: parsedDelivery.sequence,
            },
            { timeoutMs: DELIVERY_ACK_TIMEOUT_MS },
          );
        } catch (error) {
          this.deliveryGeneration += 1;
          const subscribers = delivery
            ? [...this.deliverySubscribers].filter((subscriber) => subscriber.eventType === delivery?.eventType)
            : [...this.deliverySubscribers];

          for (const subscriber of subscribers) {
            this.reportSubscriberError(subscriber, {
              context: 'handler',
              error,
              event: delivery?.eventType ?? DELIVERY_EVENT,
            });
          }

          this.reconnect();
          throw error;
        }
      });

    return this.deliveryExecution;
  }

  private emitDeliverySubscriptionContext(subscriber: SocketIODeliverySubscriber): void {
    if (subscriber.context === undefined) {
      return;
    }

    this.socket.emit(DELIVERY_SUBSCRIPTION_CONTEXT_EVENT, {
      context: subscriber.context,
      eventType: subscriber.eventType,
      revision: subscriber.contextRevision,
      subscriptionId: subscriber.subscriptionId,
    });
  }

  private synchronizeDeliverySubscriptionContexts(): void {
    for (const subscriber of this.deliverySubscribers) {
      this.emitDeliverySubscriptionContext(subscriber);
    }
  }

  private applyDesiredState(): void {
    if (!this.hasSubscribers) {
      this.clearRetry();
      this.clearStableConnectionTimer();
      this.retryAttempt = 0;
      this.disconnect();
      return;
    }

    if (this.socket.connected || this.socket.active || this.retryTimer !== undefined) {
      return;
    }

    try {
      this.socket.connect();
    } catch (error) {
      this.reportError({
        context: this.connectedOnce ? 'reconnect' : 'start',
        error,
      });
      this.scheduleRetry();
    }
  }

  private disconnect(): void {
    if (!this.socket.connected && !this.socket.active) {
      return;
    }

    try {
      this.socket.disconnect();
    } catch (error) {
      this.reportError({ context: 'stop', error });
      throw error;
    }
  }

  private scheduleRetry(): void {
    if (!this.hasSubscribers || this.retryTimer !== undefined) {
      return;
    }

    const delayIndex = Math.min(this.retryAttempt, RECONNECT_DELAYS.length - 1);
    const delay = RECONNECT_DELAYS[delayIndex] ?? 0;

    this.retryAttempt += 1;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = undefined;
      this.applyDesiredState();
    }, delay);
  }

  private clearRetry(): void {
    if (this.retryTimer === undefined) {
      return;
    }

    clearTimeout(this.retryTimer);
    this.retryTimer = undefined;
  }

  private clearStableConnectionTimer(): void {
    if (this.stableConnectionTimer === undefined) {
      return;
    }

    clearTimeout(this.stableConnectionTimer);
    this.stableConnectionTimer = undefined;
  }

  private reportError(error: SocketIOConnectionError): void {
    for (const eventSubscribers of this.events.values()) {
      for (const subscriber of eventSubscribers.subscribers) {
        this.reportSubscriberError(subscriber, error);
      }
    }
  }

  private reportSubscriberError(subscriber: Pick<SocketIOSubscriber, 'onError'>, error: SocketIOConnectionError): void {
    if (!subscriber.onError) {
      return;
    }

    void Promise.resolve(subscriber.onError(error)).catch(() => undefined);
  }

  private assertActive(): void {
    if (this.disposed) {
      throw new Error('Socket.IO connection уже освобождён.');
    }
  }
}

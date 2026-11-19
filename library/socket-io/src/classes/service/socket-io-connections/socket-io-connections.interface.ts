import type { ManagerOptions, SocketOptions } from 'socket.io-client';
import type { RealtimeDelivery } from '../../protocol/realtime-delivery.ts';

export type SocketIOConnectionErrorContext = 'handler' | 'reconnect' | 'start' | 'stop';

export interface SocketIOConnectionError {
  readonly context: SocketIOConnectionErrorContext;
  readonly error: unknown;
  readonly event?: string;
}

export type SocketIOConnectionErrorHandler = (error: SocketIOConnectionError) => void | Promise<void>;

export type SocketIOConnectionHandler<TArguments extends unknown[] = unknown[]> = (
  ...arguments_: TArguments
) => void | Promise<void>;

export type SocketIORealtimeDeliveryHandler<TPayload = unknown> = (
  payload: TPayload,
  delivery: RealtimeDelivery<TPayload>,
) => void | Promise<void>;

export interface SocketIOConnectionSubscriptionOptions {
  readonly onError?: SocketIOConnectionErrorHandler;
}

export interface SocketIOConnectionSubscription {
  dispose(): Promise<void>;
}

export interface SocketIODeliverySubscription<
  TContext extends object = Record<string, unknown>,
> extends SocketIOConnectionSubscription {
  updateContext(context: TContext): void;
}

export interface SocketIOConnectionRequestOptions {
  readonly timeoutMs?: number;
}

export type SocketIOConnectionOptions = Omit<Partial<ManagerOptions & SocketOptions>, 'autoConnect'>;

export interface SocketIOConnectionInterface {
  reconnect(): void;

  subscribeDelivery<TPayload = unknown, TContext extends object = Record<string, unknown>>(
    eventType: string,
    handler: SocketIORealtimeDeliveryHandler<TPayload>,
    options?: SocketIOConnectionSubscriptionOptions,
  ): SocketIODeliverySubscription<TContext>;

  subscribe<TArguments extends unknown[]>(
    event: string,
    handler: SocketIOConnectionHandler<TArguments>,
    options?: SocketIOConnectionSubscriptionOptions,
  ): SocketIOConnectionSubscription;

  request<Payload, Response>(
    event: string,
    payload: Payload,
    options?: SocketIOConnectionRequestOptions,
  ): Promise<Response>;
}

export abstract class SocketIOConnectionsInterface {
  abstract get(url: string, options?: SocketIOConnectionOptions): SocketIOConnectionInterface;
}

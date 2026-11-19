import 'reflect-metadata';

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  parseRealtimeDelivery,
  type RealtimeDelivery,
  type SocketIOConnectionHandler,
  type SocketIOConnectionInterface,
  type SocketIOConnectionOptions,
  type SocketIORealtimeDeliveryHandler,
} from '@library/socket-io';

import { CartChangesHub } from '../cart-changes.hub.ts';

class Connection implements SocketIOConnectionInterface {
  readonly deliveries = new Map<string, SocketIORealtimeDeliveryHandler>();

  readonly events = new Map<string, SocketIOConnectionHandler>();

  disposed = 0;

  reconnect(): void {}

  subscribeDelivery<TPayload>(event: string, handler: SocketIORealtimeDeliveryHandler<TPayload>) {
    this.deliveries.set(event, handler as SocketIORealtimeDeliveryHandler);

    return {
      dispose: async () => {
        this.disposed++;
      },
      updateContext: () => {},
    };
  }

  subscribe<TArguments extends unknown[]>(event: string, handler: SocketIOConnectionHandler<TArguments>) {
    this.events.set(event, handler as SocketIOConnectionHandler);

    return {
      dispose: async () => {
        this.disposed++;
      },
    };
  }

  request<_Payload, Response>(): Promise<Response> {
    throw new Error('Unused');
  }
}

const uuid = '00000000-0000-4000-8000-000000000001';
const cart = { uuid, version: '3', shop: { uuid, name: 'Shop' }, items: [], currencyCode: 'RUB', itemsTotal: '0.00' };
const delivery = (eventType: string): RealtimeDelivery =>
  parseRealtimeDelivery({
    channel: 'carts',
    deliveryId: uuid,
    eventType,
    schemaVersion: 2,
    sequence: '1',
    occurredAt: '2026-11-16T10:00:00.000Z',
    expiresAt: '2026-11-17T10:00:00.000Z',
    payload: cart,
  });

test('Cart Hub validates full cart snapshots without ready-triggered reads and releases subscriptions', async () => {
  const connection = new Connection();
  let options: SocketIOConnectionOptions | undefined;
  const hub = new CartChangesHub(
    { getGatewayUrl: () => 'http://localhost:4030', getSocketGatewayUrl: () => 'http://localhost:4040' },
    {
      getCurrent: () => undefined,
      subscribe: () => () => {},
      issueSocketTicket: async () => ({ ticket: 'ticket', expiresAt: '2026-11-17T00:00:00.000Z' }),
    },
    {
      get: (_url, value) => {
        options = value;

        return connection;
      },
    },
  );
  let changes = 0;
  const cleanup = hub.subscribe(async (entity) => {
    assert.deepEqual(JSON.parse(JSON.stringify(entity)), cart);
    changes++;
  });

  assert.equal(options?.path, '/socket.io/carts');
  for (const [eventType, handler] of connection.deliveries) {
    await assert.rejects(async () => handler({ cartUuid: 'invalid' }, delivery(eventType)));
    await handler(cart, delivery(eventType));
  }
  const updated = connection.deliveries.get('cart.updated')!;

  await updated({ cartUuid: uuid }, { ...delivery('cart.updated'), schemaVersion: 1 });
  const ready = connection.events.get('realtime.ready.v1');

  assert.equal(ready, undefined);
  assert.equal(changes, 4);
  await cleanup();
  assert.equal(connection.disposed, 4);
});

test('Cart Hub propagates a failed snapshot so the transport cannot acknowledge it as applied', async () => {
  const connection = new Connection();
  const hub = new CartChangesHub(
    { getGatewayUrl: () => 'http://localhost:4030', getSocketGatewayUrl: () => 'http://localhost:4040' },
    {
      getCurrent: () => undefined,
      subscribe: () => () => {},
      issueSocketTicket: async () => ({ ticket: 'ticket', expiresAt: '2026-11-17T00:00:00.000Z' }),
    },
    { get: () => connection },
  );
  const cleanup = hub.subscribe(async () => {
    throw new Error('snapshot unavailable');
  });
  const handler = connection.deliveries.get('cart.updated');

  assert.ok(handler);
  await assert.rejects(async () => handler(cart, delivery('cart.updated')), /snapshot unavailable/);
  await cleanup();
});

test('Cart Hub prepares the product thumbnail from the snapshot without fetching a product card', async () => {
  const connection = new Connection();
  const hub = new CartChangesHub(
    { getGatewayUrl: () => 'http://localhost:4030', getSocketGatewayUrl: () => 'http://localhost:4040' },
    {
      getCurrent: () => undefined,
      subscribe: () => () => {},
      issueSocketTicket: async () => ({ ticket: 'ticket', expiresAt: '2026-11-17T00:00:00.000Z' }),
    },
    { get: () => connection },
  );
  const item = {
    recordUuid: uuid,
    offerUuid: uuid,
    productUuid: uuid,
    variantUuid: uuid,
    productName: 'Кофе',
    variantName: '250 г',
    article: 'COFFEE',
    clarifications: [],
    imageUuid: uuid,
    quantity: 1,
    version: '1',
    availableQuantity: 3,
    price: null,
    subtotal: null,
    reasons: [],
    message: null,
    canCheckout: false,
    canOpenProduct: true,
    canIncrease: true,
    canDecrease: false,
    canRemove: true,
  };
  const images: Array<string | null> = [];
  const cleanup = hub.subscribe((entity) => {
    images.push(entity.items[0].imageUrl);
  });
  const handler = connection.deliveries.get('cart.updated');

  assert.ok(handler);
  await handler({ ...cart, items: [item] }, delivery('cart.updated'));
  await handler({ ...cart, items: [{ ...item, imageUuid: null }] }, delivery('cart.updated'));
  assert.deepEqual(images, [`http://localhost:4030/v1/files/${uuid}`, null]);
  await cleanup();
});

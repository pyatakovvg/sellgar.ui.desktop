import 'reflect-metadata';

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CartEntity } from '@library/domain';
import type { VisitorSession } from '@library/session';

import { CartStore } from '../../../classes/store/cart/cart.store.ts';
import { CartProvider } from '../cart.provider.ts';

const shopUuid = '00000000-0000-4000-8000-000000000001';
const cart = (version: string, shop = shopUuid) =>
  Object.assign(new CartEntity(), { uuid: shopUuid, shop: { uuid: shop, name: 'Shop' }, items: [], version });

test('provider applies socket snapshots directly, isolates sessions and shops, and only bootstraps on a new session', async () => {
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');

  Object.defineProperty(globalThis, 'window', { value: {}, configurable: true });

  const state = new CartStore();
  const signal = new AbortController().signal;
  const handlers: ((cart: CartEntity) => void | Promise<void>)[] = [];
  let sessionChanged: ((session: VisitorSession | undefined) => void) | undefined;
  let reads = 0;
  let disposals = 0;
  const provider = new CartProvider(
    {
      getSnapshot: state.getSnapshot,
      loadCart: async () => {
        reads++;
        state.load(cart('1'));
      },
      clearCart: () => state.clear(),
      dispose: () => {},
    } as unknown as ConstructorParameters<typeof CartProvider>[0],
    {
      subscribe: (handler) => {
        handlers.push(handler);

        return async () => {
          disposals++;
        };
      },
    },
    state,
    {
      getCurrent: () => ({ sessionUuid: 'first', userUuid: null, expiresAt: '2099-01-01T00:00:00.000Z' }),
      subscribe: (handler) => {
        sessionChanged = handler;

        return () => {
          sessionChanged = undefined;
        };
      },
      issueSocketTicket: async () => {
        throw new Error('Hub owns ticket retrieval');
      },
    },
  );
  let cleanup: (() => void | Promise<void>) | undefined;

  try {
    await provider.prepare({ signal, params: {}, props: {} });
    cleanup = provider.activate({ signal });
    await handlers[0]!(cart('2'));
    await handlers[0]!(cart('2')); // Projection updates can retain Cart.version.
    assert.equal(reads, 1);
    assert.equal(state.getSnapshot().cart?.version, '2');
    await handlers[0]!(cart('3', '00000000-0000-4000-8000-000000000002'));
    assert.equal(state.getSnapshot().cart?.version, '2');
    assert.ok(sessionChanged);
    sessionChanged({ sessionUuid: 'second', userUuid: null, expiresAt: '2099-01-01T00:00:00.000Z' });
    await handlers[0]!(cart('9'));
    await handlers[1]!(cart('4'));
    assert.equal(state.getSnapshot().cart?.version, '4');
    assert.equal(reads, 2);
  } finally {
    await cleanup?.();
    if (windowDescriptor) Object.defineProperty(globalThis, 'window', windowDescriptor);
    else Reflect.deleteProperty(globalThis, 'window');
  }
  assert.equal(disposals, 2);
  assert.equal(sessionChanged, undefined);
});

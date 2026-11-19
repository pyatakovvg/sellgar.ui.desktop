import 'reflect-metadata';

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { HttpException } from '@sellgar/app';

import { CartEntity, CartItemEntity, type CartServiceInterface } from '@library/domain';

import { CartStore } from '../../../store/cart/cart.store.ts';
import { CartWidgetService } from '../cart.service.ts';

const recordUuid = '00000000-0000-4000-8000-000000000001';
const otherRecordUuid = '00000000-0000-4000-8000-000000000002';
const createItem = (uuid: string, quantity: number, version = '1'): CartItemEntity =>
  Object.assign(new CartItemEntity(), { recordUuid: uuid, quantity, version });
const createCart = (items: CartItemEntity[], version = '0'): CartEntity =>
  Object.assign(new CartEntity(), { uuid: recordUuid, version, items });
const mutation = (quantity?: number, cartVersion = '2') => ({
  cartUuid: recordUuid,
  recordUuid,
  cartVersion,
  quantity,
});
const createService = (): CartServiceInterface => ({
  get: async () => createCart([]),
  addItem: async () => {
    throw new Error('Unused');
  },
  setItemQuantity: async () => {
    throw new Error('Unused');
  },
  removeItem: async () => {
    throw new Error('Unused');
  },
});

test('loads once and applies socket snapshots for subsequent commands, including a snapshot arriving before the command response', async () => {
  const state = new CartStore();
  const abort = new AbortController();
  let quantity = 2;
  let version = '5';
  const versions: string[] = [];
  let reads = 0;
  const service: CartServiceInterface = {
    ...createService(),
    get: async (signal) => {
      assert.equal(signal?.aborted, false);

      reads++;

      return createCart([createItem(recordUuid, quantity, version), createItem(otherRecordUuid, 4)], version);
    },
    setItemQuantity: async (uuid, input, signal) => {
      assert.equal(uuid, recordUuid);
      assert.equal(signal?.aborted, false);
      versions.push(input.version);
      quantity = input.quantity;
      version = String(BigInt(version) + 1n);
      state.load(createCart([createItem(recordUuid, quantity, version), createItem(otherRecordUuid, 4)], version));

      return mutation(quantity, version);
    },
  };
  const controller = new CartWidgetService(service, state);

  await controller.loadCart(abort.signal);
  assert.equal(state.getSnapshot().loaded, true);
  await controller.setQuantity(recordUuid, 3, abort.signal);
  assert.deepEqual(
    state.getSnapshot().cart?.items.map((item) => [item.recordUuid, item.quantity]),
    [
      [recordUuid, 3],
      [otherRecordUuid, 4],
    ],
  );
  await controller.setQuantity(recordUuid, 2, abort.signal);
  assert.deepEqual(versions, ['5', '6']);
  assert.equal(reads, 1);
});

test('adds a missing record and removes it when the requested quantity reaches zero', async () => {
  const state = new CartStore();
  const abort = new AbortController();
  let items: CartItemEntity[] = [];
  const calls: string[] = [];
  const service: CartServiceInterface = {
    ...createService(),
    get: async () => createCart(items),
    addItem: async (input) => {
      assert.deepEqual(input, { recordUuid, quantity: 1 });
      calls.push('add');
      items = [createItem(recordUuid, 1, '7')];
      setImmediate(() => state.load(createCart(items, '7')));

      return mutation(1, '7');
    },
    removeItem: async (uuid, version) => {
      assert.equal(uuid, recordUuid);
      assert.equal(version, '7');
      calls.push('remove');
      items = [];
      setImmediate(() => state.load(createCart(items, '8')));

      return mutation(undefined, '8');
    },
  };
  const controller = new CartWidgetService(service, state);

  await controller.loadCart(abort.signal);
  await controller.setQuantity(recordUuid, 1, abort.signal);
  assert.equal(state.getSnapshot().cart?.items[0]?.quantity, 1);
  await controller.setQuantity(recordUuid, 0, abort.signal);
  assert.deepEqual(state.getSnapshot().cart?.items, []);
  assert.deepEqual(calls, ['add', 'remove']);
});

test('waits for socket confirmation without issuing a read and cancels the wait on session change', async () => {
  const state = new CartStore();
  let reads = 0;
  const service: CartServiceInterface = {
    ...createService(),
    get: async () => {
      reads++;

      return createCart([]);
    },
    addItem: async () => mutation(1),
  };
  const controller = new CartWidgetService(service, state);
  const signal = new AbortController().signal;

  await controller.loadCart(signal);
  let completed = false;
  const adding = controller.setQuantity(recordUuid, 1, signal).then(() => {
    completed = true;
  });

  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(completed, false);
  assert.equal(controller.getSnapshot().busy, true);
  assert.equal(controller.getSnapshot().activeRecordUuid, recordUuid);
  assert.equal(controller.getSnapshot().pendingAction, 'increase');
  await assert.rejects(controller.setQuantity(otherRecordUuid, 1, signal), /Дождитесь завершения/);
  assert.equal(reads, 1);
  state.load(createCart([createItem(recordUuid, 1, '2')], '2'));
  await adding;
  assert.equal(controller.getSnapshot().busy, false);
  assert.equal(controller.getSnapshot().pendingAction, null);
  service.addItem = async () => mutation(1, '3');
  const pending = controller.setQuantity(otherRecordUuid, 1, signal);

  await new Promise((resolve) => setImmediate(resolve));
  controller.clearCart();
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(reads, 1);
});

test('failed or cancelled mutations preserve confirmed quantities and do not publish late responses', async () => {
  const state = new CartStore();
  const abort = new AbortController();
  const service: CartServiceInterface = {
    ...createService(),
    get: async () => createCart([createItem(recordUuid, 2)]),
    setItemQuantity: async () => {
      throw new Error('unavailable');
    },
  };
  const controller = new CartWidgetService(service, state);
  const args = { payload: { recordUuid, quantity: 3 }, signal: abort.signal };

  await controller.loadCart(abort.signal);
  await assert.rejects(controller.setQuantity(args.payload.recordUuid, args.payload.quantity, args.signal));
  assert.equal(state.getSnapshot().cart?.items[0]?.quantity, 2);
  assert.equal(controller.getSnapshot().busy, false);
  assert.match(controller.getSnapshot().error?.message ?? '', /Не удалось изменить/);
  assert.equal(controller.getSnapshot().activeRecordUuid, recordUuid);
  service.setItemQuantity = async () => {
    abort.abort();

    return mutation(3);
  };
  await assert.rejects(controller.setQuantity(args.payload.recordUuid, args.payload.quantity, args.signal), {
    name: 'AbortError',
  });
  assert.equal(state.getSnapshot().cart?.items[0]?.quantity, 2);
});

test('explains conflicts and session expiry without leaking technical failures', async () => {
  const state = new CartStore();
  let failure: unknown;
  const service: CartServiceInterface = {
    ...createService(),
    addItem: async () => {
      throw failure;
    },
  };
  const controller = new CartWidgetService(service, state);
  const args = { payload: { recordUuid, quantity: 1 }, signal: new AbortController().signal };

  failure = new HttpException('internal details', 409);
  await assert.rejects(
    controller.setQuantity(args.payload.recordUuid, args.payload.quantity, args.signal),
    /Количество изменилось/,
  );
  failure = new HttpException('internal details', 401);
  await assert.rejects(
    controller.setQuantity(args.payload.recordUuid, args.payload.quantity, args.signal),
    /Сессия завершена/,
  );
  failure = new Error('internal details');
  await assert.rejects(
    controller.setQuantity(args.payload.recordUuid, args.payload.quantity, args.signal),
    /Не удалось изменить количество/,
  );
});

test('failed cart reads keep quantities unknown rather than presenting an empty cart', async () => {
  const state = new CartStore();
  const service: CartServiceInterface = {
    ...createService(),
    get: async () => {
      throw new Error('unavailable');
    },
  };
  const controller = new CartWidgetService(service, state);

  await assert.rejects(controller.loadCart(new AbortController().signal));
  assert.equal(state.getSnapshot().loaded, false);
  assert.equal(state.getSnapshot().failedToLoad, true);
});

test('changing the visitor session cancels pending reads and clears the previous cart', async () => {
  const state = new CartStore();
  let finish: ((cart: CartEntity) => void) | undefined;
  const service: CartServiceInterface = {
    ...createService(),
    get: () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  };
  const controller = new CartWidgetService(service, state);
  const loading = controller.loadCart(new AbortController().signal);

  await Promise.resolve();
  controller.clearCart();
  assert.ok(finish);
  finish(createCart([createItem(recordUuid, 2)]));
  await assert.rejects(loading, { name: 'AbortError' });
  assert.equal(state.getSnapshot().cart, null);
  assert.equal(state.getSnapshot().loaded, false);
});

test('keeps the decrease indicator until socket confirmation without changing the confirmed number', async () => {
  const state = new CartStore();

  state.load(createCart([createItem(recordUuid, 3)], '1'));
  const service = new CartWidgetService(
    {
      ...createService(),
      setItemQuantity: async () => mutation(2),
    },
    state,
  );
  const changing = service.setQuantity(recordUuid, 2);

  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(service.getSnapshot().pendingAction, 'decrease');
  assert.equal(service.getSnapshot().cart?.items[0]?.quantity, 3);
  state.load(createCart([createItem(recordUuid, 2, '2')], '2'));
  await changing;
  assert.equal(service.getSnapshot().pendingAction, null);
  assert.equal(service.getSnapshot().busy, false);
  assert.equal(service.getSnapshot().cart?.items[0]?.quantity, 2);
});

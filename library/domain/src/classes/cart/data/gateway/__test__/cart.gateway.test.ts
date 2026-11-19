import 'reflect-metadata';

import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';

import {
  type RequestExecutionOptions,
  RequestExecutorInterface,
  type RequestInterceptorRegistration,
  type RequestOperation,
  type ResponseInterceptorRegistration,
} from '@sellgar/app';

import { Config } from '../../../../../infrastructure/config/config.ts';
import { HttpClient } from '../../../../../infrastructure/http-client/http.client.ts';
import { CartEntity } from '../../../domain/cart.entity.ts';
import { CartItemEntity } from '../../../domain/cart-item.entity.ts';
import { CartGateway } from '../cart.gateway.ts';

class TestRequestExecutor extends RequestExecutorInterface {
  readonly abort = new AbortController();

  scopes: Array<string | undefined> = [];

  get request(): RequestInterceptorRegistration {
    throw new Error('Unused interceptor registration');
  }

  get response(): ResponseInterceptorRegistration {
    throw new Error('Unused interceptor registration');
  }

  run<T>(operation: RequestOperation<T>): Promise<T>;

  run<T>(options: RequestExecutionOptions, operation: RequestOperation<T>): Promise<T>;

  run<T>(
    optionsOrOperation: RequestExecutionOptions | RequestOperation<T>,
    operation?: RequestOperation<T>,
  ): Promise<T> {
    if (typeof optionsOrOperation === 'function') return optionsOrOperation({ signal: this.abort.signal });

    this.scopes.push(optionsOrOperation.scope);
    if (!operation) throw new Error('Missing operation');

    return operation({ signal: this.abort.signal });
  }
}

const recordUuid = '00000000-0000-4000-8000-000000000001';
const cartUuid = '00000000-0000-4000-8000-000000000002';
const shopUuid = '00000000-0000-4000-8000-000000000003';
const mutation = { cartUuid, recordUuid, cartVersion: '2', quantity: 1 };
const createGateway = () => {
  const executor = new TestRequestExecutor();

  return {
    executor,
    gateway: new CartGateway(
      new Config('https://gateway.example.test', 'https://socket.example.test'),
      new HttpClient({ getUniqueId: () => 'browser-device' }),
      executor,
    ),
  };
};

afterEach(() => mock.restoreAll());

test('cart operations send cookie credentials and only public item fields', async () => {
  const { gateway, executor } = createGateway();
  const requests: { url: string; options: RequestInit }[] = [];

  mock.method(globalThis, 'fetch', async (url: URL, options: RequestInit) => {
    requests.push({ url: url.href, options });

    return Response.json(mutation);
  });
  await gateway.addItem({ recordUuid, quantity: 1, ownerUuid: shopUuid, idempotencyKey: shopUuid } as Parameters<
    CartGateway['addItem']
  >[0]);
  await gateway.setItemQuantity(recordUuid, { quantity: 2, version: '1' });
  await gateway.removeItem(recordUuid, '2');

  assert.deepEqual(
    requests.map(({ url, options }) => [url, options.method, JSON.parse(options.body as string)]),
    [
      ['https://gateway.example.test/v1/cart/items', 'POST', { recordUuid, quantity: 1 }],
      [`https://gateway.example.test/v1/cart/items/${recordUuid}`, 'PATCH', { quantity: 2, version: '1' }],
      [`https://gateway.example.test/v1/cart/items/${recordUuid}`, 'DELETE', { version: '2' }],
    ],
  );
  for (const { options } of requests) {
    assert.equal(options.credentials, 'include');
    assert.equal(options.cache, 'no-store');
    assert.deepEqual(options.headers, { 'x-device-id': 'browser-device', 'Content-Type': 'application/json' });
  }
  assert.equal(executor.scopes.length, 3);
});

test('invalid quantities, identifiers and versions are rejected before HTTP', async () => {
  const { gateway } = createGateway();
  const fetch = mock.method(globalThis, 'fetch');

  await assert.rejects(gateway.addItem({ recordUuid, quantity: 0 }));
  await assert.rejects(gateway.addItem({ recordUuid: 'invalid', quantity: 1 }));
  await assert.rejects(gateway.setItemQuantity(recordUuid, { quantity: 1.5, version: '1' }));
  await assert.rejects(gateway.removeItem(recordUuid, '0'));
  await assert.rejects(gateway.removeItem('invalid', '1'));
  assert.equal(fetch.mock.callCount(), 0);
});

test('cart reads validate nested data and preserve exact money strings', async () => {
  const { gateway } = createGateway();
  const item = {
    recordUuid,
    offerUuid: null,
    productUuid: null,
    variantUuid: null,
    productName: 'Кофе',
    variantName: null,
    article: 'COFFEE',
    clarifications: ['250 г'],
    imageUuid: recordUuid,
    quantity: 1,
    version: '1',
    availableQuantity: 3,
    price: { uuid: recordUuid, value: '123456789012345.67', currencyCode: 'RUB' },
    subtotal: '123456789012345.67',
    reasons: [],
    message: null,
    canCheckout: true,
    canOpenProduct: false,
    canIncrease: true,
    canDecrease: false,
    canRemove: true,
  };
  const cart = {
    uuid: cartUuid,
    version: '1',
    shop: { uuid: shopUuid, name: 'Центр' },
    items: [item],
    currencyCode: 'RUB',
    itemsTotal: item.subtotal,
  };

  mock.method(globalThis, 'fetch', async () => Response.json(cart));
  const result = await gateway.get();

  assert.ok(result instanceof CartEntity);
  assert.ok(result.items[0] instanceof CartItemEntity);
  assert.equal(result.items[0].imageUrl, `https://gateway.example.test/v1/files/${recordUuid}`);
  assert.equal(result.items[0].price?.value, item.price.value);
  assert.equal(result.itemsTotal, item.subtotal);
  mock.method(globalThis, 'fetch', async () =>
    Response.json({ ...cart, items: [{ ...item, price: { ...item.price, value: 12.34 } }] }),
  );
  await assert.rejects(gateway.get());
});

test('cart mutation uses both caller and application cancellation signals', async () => {
  const { gateway, executor } = createGateway();
  const caller = new AbortController();
  let signal: AbortSignal;

  mock.method(globalThis, 'fetch', async (_url: URL, options: RequestInit) => {
    signal = options.signal!;

    return Response.json(mutation);
  });
  await gateway.addItem({ recordUuid, quantity: 1 }, caller.signal);
  caller.abort();
  assert.equal(signal!.aborted, true);
  await gateway.removeItem(recordUuid, '1');
  executor.abort.abort();
  assert.equal(signal!.aborted, true);
});

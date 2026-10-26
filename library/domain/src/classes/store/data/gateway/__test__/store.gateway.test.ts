import 'reflect-metadata';
import assert from 'node:assert/strict';
import { afterEach, test, mock } from 'node:test';
import { instanceToPlain } from 'class-transformer';
import {
  RequestExecutorInterface,
  type RequestOperation,
  type RequestExecutionOptions,
  type RequestInterceptorRegistration,
  type ResponseInterceptorRegistration,
} from '@sellgar/app';
import { StoreGateway } from '../store.gateway.ts';
import { StoreOfferEntity } from '../../../domain/store-offer.entity.ts';
import { StoreOfferResultEntity } from '../../../domain/store-offer-result.entity.ts';
import { Config } from '../../../../../infrastructure/config/config.ts';
import { HttpClient } from '../../../../../infrastructure/http-client/http.client.ts';
import { createStoreOffer, offerUuid } from './store-offer.fixture.ts';
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
const createGateway = () => {
  const executor = new TestRequestExecutor();
  return {
    executor,
    gateway: new StoreGateway(new Config('https://gateway.example.test'), new HttpClient(), executor),
  };
};
afterEach(() => mock.restoreAll());
test('catalog returns validated domain entities and preserves identity, metadata and money strings', async () => {
  const offer = instanceToPlain(createStoreOffer());
  mock.method(globalThis, 'fetch', async () => Response.json({ data: [offer], meta: { totalRows: 13 } }));
  const { gateway, executor } = createGateway();
  const result = await gateway.getAll();
  assert.ok(result instanceof StoreOfferResultEntity);
  assert.ok(result.data[0] instanceof StoreOfferEntity);
  assert.equal(result.data[0].uuid, offerUuid);
  assert.equal(result.data[0].product.uuid, offer.productUuid);
  assert.equal(result.data[0].records[0].inventory.version, 2);
  assert.equal(result.data[0].currentPrice?.value, '1500.00');
  assert.equal(result.meta.totalRows, 13);
  assert.deepEqual(executor.scopes, ['store-offers:list']);
  assert.equal('failedToLoad' in result, false);
});
test('gateway rejects invalid UUIDs and nested records before they reach the service', async () => {
  const { gateway } = createGateway();
  const offer = instanceToPlain(createStoreOffer());
  mock.method(globalThis, 'fetch', async () => Response.json({ data: [{ ...offer, uuid: 'bad-uuid' }], meta: {} }));
  await assert.rejects(gateway.getAll());
  mock.method(globalThis, 'fetch', async () =>
    Response.json({
      data: [
        { ...offer, records: [{ ...offer.records[0], inventory: { ...offer.records[0].inventory, available: '12' } }] },
      ],
      meta: {},
    }),
  );
  await assert.rejects(gateway.getAll());
});
test('catalog forwards both cancellation sources through RequestExecutor and bypasses fetch cache', async () => {
  const { gateway, executor } = createGateway();
  const loader = new AbortController();
  let requested: unknown[] = [];
  mock.method(globalThis, 'fetch', async (...args: unknown[]) => {
    requested = args;
    return Response.json({ data: [], meta: {} });
  });
  await gateway.getAll(loader.signal);
  const init = requested[1] as RequestInit;
  assert.equal(String(requested[0]), 'https://gateway.example.test/v1/products');
  assert.equal(init.cache, 'no-store');
  const signal = init.signal!;
  loader.abort();
  assert.equal(signal.aborted, true);
  const secondLoader = new AbortController();
  await gateway.getAll(secondLoader.signal);
  const secondSignal = (requested[1] as RequestInit).signal!;
  executor.abort.abort();
  assert.equal(secondSignal.aborted, true);
});
test('offer lookup encodes the identifier and propagates HTTP 404 instead of inventing an empty entity', async () => {
  const { gateway, executor } = createGateway();
  let requested = '';
  mock.method(globalThis, 'fetch', async (url: URL) => {
    requested = String(url);
    return new Response(null, { status: 404 });
  });
  await assert.rejects(
    gateway.findOfferByUuid('missing/offer'),
    (error) => (error as { status: number }).status === 404,
  );
  assert.equal(requested, 'https://gateway.example.test/v1/offers/missing%2Foffer');
  assert.deepEqual(executor.scopes, ['store-offer:missing/offer']);
});
test('offer detail and siblings are validated, mapped and returned as domain instances', async () => {
  const { gateway } = createGateway();
  const offer = instanceToPlain(createStoreOffer());
  mock.method(globalThis, 'fetch', async () => Response.json({ offer, siblingOffers: [offer] }));
  const result = await gateway.findOfferByUuid(offerUuid);
  assert.ok(result.offer instanceof StoreOfferEntity);
  assert.ok(result.siblingOffers[0] instanceof StoreOfferEntity);
  assert.deepEqual(
    result.offer.records[0].clarifications.map((x) => x.value),
    ['S', 'Упаковка'],
  );
});

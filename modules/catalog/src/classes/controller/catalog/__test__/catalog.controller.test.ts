import 'reflect-metadata';
import assert from 'node:assert/strict';
import { afterEach, test, mock } from 'node:test';
import type { StoreServiceInterface } from '@library/domain';
import {
  createStoreOffer,
  offerUuid,
} from '../../../../../../../library/domain/src/classes/store/data/gateway/__test__/store-offer.fixture.ts';
import { CatalogController } from '../catalog.controller.ts';
afterEach(() => mock.restoreAll());
test('catalog controller forwards its input to the service and serializes nested domain instances for SSR', async () => {
  const abort = new AbortController();
  let received: unknown[] = [];
  const offer = createStoreOffer();
  const service: StoreServiceInterface = {
    getAll: async (...args) => {
      received = args;
      return { data: [offer], meta: { totalRows: 1 } };
    },
    findOfferByUuid: async (...args) => {
      received = args;
      return { offer, siblingOffers: [offer] };
    },
  };
  const controller = new CatalogController(service);
  const result = await controller.loader({ signal: abort.signal });
  assert.equal(result.products[0].uuid, offerUuid);
  assert.equal(result.failedToLoad, false);
  assert.equal(Object.getPrototypeOf(result.products[0]), Object.prototype);
  assert.equal(Object.getPrototypeOf(result.products[0].records[0].inventory), Object.prototype);
  assert.deepEqual(received, [abort.signal]);
});
test('catalog controller owns the UI failure state and propagates cancellation', async () => {
  const abort = new AbortController();
  const service: StoreServiceInterface = {
    getAll: async () => {
      throw new Error('unavailable');
    },
    findOfferByUuid: async () => {
      throw new Error('unavailable');
    },
  };
  mock.method(console, 'error', () => {});
  const controller = new CatalogController(service);
  assert.deepEqual(await controller.loader({ signal: abort.signal }), { products: [], failedToLoad: true });
  abort.abort();
  mock.method(service, 'getAll', async () => {
    throw abort.signal.reason;
  });
  await assert.rejects(controller.loader({ signal: abort.signal }), { name: 'AbortError' });
});

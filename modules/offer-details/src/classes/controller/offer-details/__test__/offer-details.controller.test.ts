import 'reflect-metadata';
import assert from 'node:assert/strict';
import { afterEach, test, mock } from 'node:test';
import { NotFoundException } from '@sellgar/app';
import type { StoreServiceInterface } from '@library/domain';
import {
  createStoreOffer,
  offerUuid,
} from '../../../../../../../library/domain/src/classes/store/data/gateway/__test__/store-offer.fixture.ts';
import { OfferDetailsController } from '../offer-details.controller.ts';
afterEach(() => mock.restoreAll());
test('offer-details controller forwards its input to the service and serializes nested domain instances for SSR', async () => {
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
  const controller = new OfferDetailsController(service);
  const result = await controller.loader({ signal: abort.signal, params: { uuid: offerUuid } });
  assert.equal(result.offer?.uuid, offerUuid);
  assert.equal(result.siblingOffers.length, 1);
  assert.equal(result.failedToLoad, false);
  assert.equal(Object.getPrototypeOf(result.offer), Object.prototype);
  assert.deepEqual(received, [offerUuid, abort.signal]);
});
test('offer-details controller owns the UI failure state and propagates cancellation', async () => {
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
  const controller = new OfferDetailsController(service);
  assert.deepEqual(await controller.loader({ signal: abort.signal, params: { uuid: offerUuid } }), {
    offer: null,
    siblingOffers: [],
    failedToLoad: true,
  });
  abort.abort();
  mock.method(service, 'findOfferByUuid', async () => {
    throw abort.signal.reason;
  });
  await assert.rejects(controller.loader({ signal: abort.signal, params: { uuid: offerUuid } }), {
    name: 'AbortError',
  });
});
test('only the offer controller maps HTTP 404 into the missing-offer state', async () => {
  const service: StoreServiceInterface = {
    getAll: async () => ({ data: [], meta: {} }),
    findOfferByUuid: async () => {
      throw new NotFoundException('missing');
    },
  };
  const result = await new OfferDetailsController(service).loader({
    signal: new AbortController().signal,
    params: { uuid: offerUuid },
  });
  assert.deepEqual(result, { offer: null, siblingOffers: [], failedToLoad: false });
});

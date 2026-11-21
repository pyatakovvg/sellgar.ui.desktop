import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createStoreOffer } from '../../../../library/domain/src/classes/store/data/gateway/__test__/store-offer.fixture.ts';
import { formatPrice, formatRecordPrice } from './offer.formatter.ts';

test('formats the service range and the individual record price separately', () => {
  const offer = createStoreOffer();

  offer.priceRange!.min = '1000.00';
  offer.priceRange!.max = '3000.00';
  assert.equal(formatPrice(offer), '1 000 руб. ... 3 000 руб.');
  assert.equal(formatRecordPrice(offer.records[0]), '1 500 руб.');
  offer.priceRange!.max = '1000.00';
  assert.equal(formatPrice(offer), '1 000 руб.');
  offer.records[0].currentPrice!.value = '0.00';
  assert.equal(formatRecordPrice(offer.records[0]), '0 руб.');
});

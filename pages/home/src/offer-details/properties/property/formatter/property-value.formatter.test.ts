import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ProductFieldEntity } from '@library/domain';
import { formatPropertyValue } from './property-value.formatter.ts';

const empty: ProductFieldEntity['values'][number] = {
  valueText: null,
  valueInteger: null,
  valueDecimal: null,
  valueBoolean: null,
  valueDate: null,
  valueOptionCode: null,
};

test('не теряет false и нулевые числовые значения', () => {
  assert.equal(formatPropertyValue('BOOLEAN', { ...empty, valueBoolean: false }), 'Нет');
  assert.equal(formatPropertyValue('BOOLEAN', { ...empty, valueBoolean: true }), 'Да');
  assert.equal(formatPropertyValue('INTEGER', { ...empty, valueInteger: '0' }), '0');
  assert.equal(formatPropertyValue('DECIMAL', { ...empty, valueDecimal: '0.00' }), '0.00');
});

test('сохраняет текст и отличает отсутствие значения от false', () => {
  assert.equal(formatPropertyValue('TEXT', { ...empty, valueText: 'Хлопок' }), 'Хлопок');
  assert.equal(formatPropertyValue('BOOLEAN', empty), '');
  assert.equal(formatPropertyValue('INTEGER', empty), '');
});

test('отображает дату без смещения из-за часового пояса', () => {
  assert.equal(formatPropertyValue('DATE', { ...empty, valueDate: '2026-10-16' }), '16.10.2026');
});

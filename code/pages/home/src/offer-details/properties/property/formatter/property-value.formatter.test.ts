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
  assert.equal(formatPropertyValue('DECIMAL', { ...empty, valueDecimal: '0.00' }), '0');
});

test('убирает конечные нули дробной части без округления и потери точности', () => {
  const values = [
    ['6.100000000000', '6.1'],
    ['48.000000000000', '48'],
    ['71.600000000000', '71.6'],
    ['1000.000000000000', '1000'],
    ['0.000000000001', '0.000000000001'],
    ['-12.340000000000', '-12.34'],
    ['12345678901234567890123456.123456789012', '12345678901234567890123456.123456789012'],
  ];

  for (const [input, expected] of values) {
    assert.equal(formatPropertyValue('DECIMAL', { ...empty, valueDecimal: input }), expected);
  }

  assert.equal(formatPropertyValue('DECIMAL', empty), '');
});

test('сохраняет текст и отличает отсутствие значения от false', () => {
  assert.equal(formatPropertyValue('TEXT', { ...empty, valueText: 'Хлопок' }), 'Хлопок');
  assert.equal(formatPropertyValue('BOOLEAN', empty), '');
  assert.equal(formatPropertyValue('INTEGER', empty), '');
});

test('отображает дату без смещения из-за часового пояса', () => {
  assert.equal(formatPropertyValue('DATE', { ...empty, valueDate: '2026-10-16' }), '16.10.2026');
});

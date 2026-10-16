import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { StorefrontOfferInput } from '@page/home';
import { StorefrontMapper } from './storefront.mapper.ts';

const createOffer = (): StorefrontOfferInput => ({
  offerUuid: 'offer',
  storeProductUuid: 'store',
  productUuid: 'product',
  variantUuid: 'variant',
  name: 'Синяя',
  description: null,
  brand: { name: 'Бренд' },
  product: { name: 'Майка', description: null, properties: [] },
  variant: { name: 'Синяя', description: null, properties: [], images: [] },
  records: [
    {
      uuid: 's',
      article: 'BLUE-S',
      clarifications: [
        { position: 1, value: 'Упаковка' },
        { position: 0, value: 'S' },
      ],
      inventory: { recordUuid: 's', available: 12 },
    },
    { uuid: 'l', article: 'BLUE-L', clarifications: [], inventory: { recordUuid: 'l', available: 0 } },
  ],
  currentPrice: { value: '1500.00', currencyCode: 'RUB' },
});

const mapper = new StorefrontMapper('http://localhost:4030');

test('сохраняет отдельные записи, их артикулы, остатки и цену предложения', () => {
  const result = mapper.toOffer(createOffer());
  assert.deepEqual(
    result.records.map((record) => [record.uuid, record.article, record.inventory.available]),
    [
      ['s', 'BLUE-S', 12],
      ['l', 'BLUE-L', 0],
    ],
  );
  assert.equal(result.currentPrice?.value, '1500.00');
  assert.equal('article' in result, false);
  assert.equal('inventory' in result, false);
});

test('упорядочивает уточнения, не меняя исходный ответ gateway', () => {
  const source = createOffer();
  const before = structuredClone(source);
  assert.deepEqual(
    mapper.toOffer(source).records[0].clarifications.map((item) => item.value),
    ['S', 'Упаковка'],
  );
  assert.deepEqual(source, before);
});

test('работает с единственной записью без уточнений и с отсутствием записей', () => {
  const source = createOffer();
  source.records = [source.records[1]];
  assert.deepEqual(mapper.toOffer(source).records[0].clarifications, []);
  source.records = [];
  assert.deepEqual(mapper.toOffer(source).records, []);
});

test('разрешает изображения варианта и опций и сохраняет типизированные значения', () => {
  const source = createOffer();
  source.variant.images = [
    { imageUuid: 'second', imageUrl: '/v1/files/second', fileName: 'second.png', order: 1 },
    { imageUuid: 'first', imageUrl: 'https://cdn.example.test/first.png', fileName: 'first.png', order: 0 },
  ];
  source.product.properties = [
    {
      propertyCode: 'color',
      sortOrder: 0,
      property: {
        name: 'Цвет',
        kind: 'OPTIONS',
        unitCode: null,
        options: [
          {
            code: 'blue',
            name: 'Синий',
            sortOrder: 0,
            extras: [
              {
                type: 'IMAGE',
                sortOrder: 1,
                textDisplay: null,
                valueText: null,
                valueColor: null,
                imageUuid: 'blue-texture',
              },
              {
                type: 'COLOR',
                sortOrder: 0,
                textDisplay: null,
                valueText: null,
                valueColor: '#0000ff',
                imageUuid: null,
              },
            ],
          },
        ],
      },
      values: [
        {
          valueOptionCode: 'blue',
          valueText: null,
          valueInteger: null,
          valueDecimal: null,
          valueBoolean: null,
          valueDate: null,
        },
      ],
    },
  ];
  const before = structuredClone(source);
  const result = mapper.toOffer(source);
  assert.deepEqual(
    result.variant.images.map((image) => image.imageUrl),
    ['https://cdn.example.test/first.png', 'http://localhost:4030/v1/files/second'],
  );
  const field = result.product.properties[0];
  assert.equal(field.property.options[0].extras[1].imageUrl, 'http://localhost:4030/v1/files/blue-texture');
  assert.equal(field.values[0].valueOptionCode, 'blue');
  assert.deepEqual(source, before);
});

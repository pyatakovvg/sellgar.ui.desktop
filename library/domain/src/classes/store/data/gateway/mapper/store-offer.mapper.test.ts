import assert from 'node:assert/strict';
import { test } from 'node:test';
import 'reflect-metadata';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ProductFieldEntity } from '@library/domain';
import type { StoreOfferEntity } from '../../../domain/store-offer.entity.ts';
import { createStoreOffer, imageUuid } from '../__test__/store-offer.fixture.ts';
import { StoreOfferMapper } from './store-offer.mapper.ts';

const createOffer = createStoreOffer;

const mapper = { toOffer: (offer: StoreOfferEntity) => StoreOfferMapper.toOffer(offer, 'http://localhost:4030') };

test('сохраняет отдельные записи, их артикулы, остатки и цену предложения', () => {
  const result = mapper.toOffer(createOffer());
  assert.deepEqual(
    result.records.map((record) => [record.uuid, record.article, record.inventory.available]),
    [
      ['00000000-0000-4000-8000-000000000005', 'BLUE-S', 12],
      ['00000000-0000-4000-8000-000000000007', 'BLUE-L', 0],
    ],
  );
  assert.equal(result.currentPrice?.value, '1500.00');
  assert.equal('article' in result, false);
  assert.equal('inventory' in result, false);
});

test('упорядочивает уточнения, не меняя исходный ответ gateway', () => {
  const source = createOffer();
  const before = instanceToPlain(source);
  assert.deepEqual(
    mapper.toOffer(source).records[0].clarifications.map((item) => item.value),
    ['S', 'Упаковка'],
  );
  assert.deepEqual(instanceToPlain(source), before);
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
    { imageUuid, imageUrl: '/v1/files/second', fileName: 'second.png', order: 1 },
    { imageUuid, imageUrl: 'https://cdn.example.test/first.png', fileName: 'first.png', order: 0 },
  ];
  source.product.properties = plainToInstance(ProductFieldEntity, [
    {
      propertyCode: 'color',
      required: true,
      multiple: false,
      sortOrder: 0,
      property: {
        code: 'color',
        name: 'Цвет',
        description: null,
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
                imageUuid,
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
  ]);
  const before = instanceToPlain(source);
  const result = mapper.toOffer(source);
  assert.deepEqual(
    result.variant.images.map((image) => image.imageUrl),
    ['https://cdn.example.test/first.png', 'http://localhost:4030/v1/files/second'],
  );
  const field = result.product.properties[0];
  assert.equal(field.property.options[0].extras[1].imageUrl, `http://localhost:4030/v1/files/${imageUuid}`);
  assert.equal(field.values[0].valueOptionCode, 'blue');
  assert.deepEqual(instanceToPlain(source), before);
});

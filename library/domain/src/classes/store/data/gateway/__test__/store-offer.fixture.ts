import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { StoreOfferEntity } from '../../../domain/store-offer.entity.ts';
export const offerUuid = '00000000-0000-4000-8000-000000000001';
export const productUuid = '00000000-0000-4000-8000-000000000002';
export const variantUuid = '00000000-0000-4000-8000-000000000003';
export const imageUuid = '00000000-0000-4000-8000-000000000008';
export const date = '2026-10-26T12:00:00.000Z';
export const createStoreOffer = (): StoreOfferEntity =>
  plainToInstance(StoreOfferEntity, {
    uuid: offerUuid,
    storeProductUuid: '00000000-0000-4000-8000-000000000004',
    productUuid,
    variantUuid,
    product: { uuid: productUuid, name: 'Майка', description: null, properties: [] },
    brand: { code: 'brand', name: 'Бренд', description: null },
    variant: { uuid: variantUuid, name: 'Синяя', description: null, properties: [], images: [] },
    records: [
      {
        uuid: '00000000-0000-4000-8000-000000000005',
        offerUuid,
        article: 'BLUE-S',
        version: 1,
        clarifications: [
          { position: 1, value: 'Упаковка' },
          { position: 0, value: 'S' },
        ],
        inventory: {
          uuid: '00000000-0000-4000-8000-000000000006',
          recordUuid: '00000000-0000-4000-8000-000000000005',
          quantity: 12,
          reserved: 0,
          available: 12,
          version: 2,
          updatedAt: date,
        },
        createdAt: date,
        updatedAt: date,
      },
      {
        uuid: '00000000-0000-4000-8000-000000000007',
        offerUuid,
        article: 'BLUE-L',
        version: 3,
        clarifications: [],
        inventory: {
          uuid: '00000000-0000-4000-8000-000000000009',
          recordUuid: '00000000-0000-4000-8000-000000000007',
          quantity: 0,
          reserved: 0,
          available: 0,
          version: 1,
          updatedAt: date,
        },
        createdAt: date,
        updatedAt: date,
      },
    ],
    currentPrice: {
      uuid: '00000000-0000-4000-8000-000000000010',
      value: '1500.00',
      currencyCode: 'RUB',
      currency: { code: 'RUB', value: 'руб.', order: 0, createdAt: date, updatedAt: date },
    },
    createdAt: date,
    updatedAt: date,
  });

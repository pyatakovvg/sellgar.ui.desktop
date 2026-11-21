import type { StoreAccountingRecordEntity } from '@library/domain';
import type { StoreOfferEntity } from '@library/domain';

export const formatPrice = (offer: StoreOfferEntity): string => {
  const range = offer.priceRange;

  if (!range) return 'Цена уточняется';

  const amounts = range.min === range.max ? [range.min] : [range.min, range.max];

  return amounts.map((value) => formatMoney(value, range.currency?.value ?? range.currencyCode)).join(' ... ');
};

export const formatRecordPrice = (record: StoreAccountingRecordEntity): string => {
  const price = record.currentPrice;

  return price ? formatMoney(price.value, price.currency?.value ?? price.currencyCode) : 'Цена уточняется';
};

const formatMoney = (value: string, currency: string): string => `${Number(value).toLocaleString('ru-RU')} ${currency}`;

export const getPreviewImage = (offer: StoreOfferEntity) => offer.variant.images.find((image) => image.imageUrl);

export const getInitials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export const getClarifications = (record: StoreAccountingRecordEntity): string[] =>
  [...record.clarifications].sort((left, right) => left.position - right.position).map((item) => item.value);

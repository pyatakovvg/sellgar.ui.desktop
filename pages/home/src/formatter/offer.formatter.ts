import type { AccountingRecordInput } from '../input/accounting-record.input.ts';
import type { StorefrontOfferInput } from '../input/storefront-offer.input.ts';

export const formatPrice = (offer: StorefrontOfferInput): string => {
  if (!offer.currentPrice) return 'Цена уточняется';
  const price = offer.currentPrice;
  const value = Number(price.value);
  const formatted = Number.isFinite(value) ? value.toLocaleString('ru-RU') : price.value;
  return `${formatted} ${price.currency?.value ?? price.currencyCode}`;
};

export const getPreviewImage = (offer: StorefrontOfferInput) => offer.variant.images.find((image) => image.imageUrl);

export const getInitials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export const getClarifications = (record: AccountingRecordInput): string[] =>
  [...record.clarifications].sort((left, right) => left.position - right.position).map((item) => item.value);

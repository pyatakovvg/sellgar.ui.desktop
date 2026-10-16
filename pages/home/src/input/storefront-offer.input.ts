import type { AccountingRecordInput } from './accounting-record.input.ts';
import type { StorefrontFieldInput } from './storefront-field.input.ts';

export interface StorefrontOfferInput {
  offerUuid: string;
  storeProductUuid: string;
  productUuid: string;
  variantUuid: string;
  name: string;
  description: string | null;
  product: { name: string; description: string | null; properties: StorefrontFieldInput[] };
  brand: { name: string } | null;
  variant: {
    name: string;
    description: string | null;
    properties: StorefrontFieldInput[];
    images: Array<{ imageUuid: string; imageUrl: string; fileName: string; order: number }>;
  };
  records: AccountingRecordInput[];
  currentPrice: {
    value: string;
    currencyCode: string;
    currency?: { value: string };
  } | null;
}

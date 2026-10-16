import 'server-only';
import type { StorefrontOfferInput } from '@page/home';

import { StorefrontMapper } from './mapper/storefront.mapper.ts';

export class StorefrontGateway {
  private readonly mapper: StorefrontMapper;

  constructor(private readonly url: string) {
    this.mapper = new StorefrontMapper(url);
  }

  async getAll() {
    try {
      const response = await fetch(new URL('/v1/products', this.url), { cache: 'no-store' });
      if (!response.ok) throw new Error(`Storefront catalog returned ${response.status}`);
      const result: { data: StorefrontOfferInput[] } = await response.json();
      return { products: result.data.map((offer) => this.mapper.toOffer(offer)), failedToLoad: false };
    } catch (error) {
      console.error('Unable to load storefront catalog', error);
      return { products: [], failedToLoad: true };
    }
  }

  async getByUuid(uuid: string) {
    try {
      const response = await fetch(new URL(`/v1/offers/${encodeURIComponent(uuid)}`, this.url), { cache: 'no-store' });
      if (response.status === 404) return { offer: null, siblingOffers: [], failedToLoad: false };
      if (!response.ok) throw new Error(`Storefront offer returned ${response.status}`);
      const result: { offer: StorefrontOfferInput; siblingOffers: StorefrontOfferInput[] } = await response.json();
      return {
        offer: this.mapper.toOffer(result.offer),
        siblingOffers: result.siblingOffers.map((offer) => this.mapper.toOffer(offer)),
        failedToLoad: false,
      };
    } catch (error) {
      console.error('Unable to load storefront offer', error);
      return { offer: null, siblingOffers: [], failedToLoad: true };
    }
  }
}

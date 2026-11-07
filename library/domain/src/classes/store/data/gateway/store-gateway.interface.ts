import type { StoreOfferDetailsEntity } from '../../domain/store-offer-details.entity.ts';
import type { StoreOfferResultEntity } from '../../domain/store-offer-result.entity.ts';

export abstract class StoreGatewayInterface {
  abstract getAll(signal?: AbortSignal): Promise<StoreOfferResultEntity>;

  abstract findOfferByUuid(uuid: string, signal?: AbortSignal): Promise<StoreOfferDetailsEntity>;
}

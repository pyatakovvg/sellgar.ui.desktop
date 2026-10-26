import { Inject, Injectable } from '@sellgar/app';
import { StoreGatewayInterface } from '../data/gateway/store-gateway.interface.ts';
import { StoreServiceInterface } from './store-service.interface.ts';
import type { StoreOfferResultEntity } from '../domain/store-offer-result.entity.ts';
import type { StoreOfferDetailsEntity } from '../domain/store-offer-details.entity.ts';
@Injectable()
export class StoreService implements StoreServiceInterface {
  constructor(@Inject(StoreGatewayInterface) private readonly storeGateway: StoreGatewayInterface) {}
  getAll(signal?: AbortSignal): Promise<StoreOfferResultEntity> {
    return this.storeGateway.getAll(signal);
  }
  findOfferByUuid(uuid: string, signal?: AbortSignal): Promise<StoreOfferDetailsEntity> {
    return this.storeGateway.findOfferByUuid(uuid, signal);
  }
}

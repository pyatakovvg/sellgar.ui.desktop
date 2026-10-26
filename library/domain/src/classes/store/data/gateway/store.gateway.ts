import { Inject, Injectable, RequestExecutorInterface } from '@sellgar/app';
import { plainToInstance, type ClassConstructor } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { ConfigInterface } from '../../../../infrastructure/config/config.interface.ts';
import { HttpClientInterface } from '../../../../infrastructure/http-client/http-client.interface.ts';
import { StoreOfferEntity } from '../../domain/store-offer.entity.ts';
import { StoreOfferResultEntity } from '../../domain/store-offer-result.entity.ts';
import { StoreOfferDetailsEntity } from '../../domain/store-offer-details.entity.ts';
import { StoreGatewayInterface } from './store-gateway.interface.ts';
import { StoreOfferMapper } from './mapper/store-offer.mapper.ts';
@Injectable()
export class StoreGateway implements StoreGatewayInterface {
  constructor(
    @Inject(ConfigInterface) private readonly config: ConfigInterface,
    @Inject(HttpClientInterface) private readonly httpClient: HttpClientInterface,
    @Inject(RequestExecutorInterface) private readonly requestExecutor: RequestExecutorInterface,
  ) {}
  async getAll(signal?: AbortSignal): Promise<StoreOfferResultEntity> {
    const result = await this.requestExecutor.run({ scope: 'store-offers:list' }, (request) =>
      this.httpClient.get(
        new URL('/v1/products', this.config.getGatewayUrl()),
        signal ? AbortSignal.any([signal, request.signal]) : request.signal,
      ),
    );
    const entity = await this.toEntity(StoreOfferResultEntity, result);
    entity.data = await Promise.all(entity.data.map((offer) => this.toOffer(offer)));
    return entity;
  }
  async findOfferByUuid(uuid: string, signal?: AbortSignal): Promise<StoreOfferDetailsEntity> {
    const result = await this.requestExecutor.run({ scope: `store-offer:${uuid}` }, (request) =>
      this.httpClient.get(
        new URL(`/v1/offers/${encodeURIComponent(uuid)}`, this.config.getGatewayUrl()),
        signal ? AbortSignal.any([signal, request.signal]) : request.signal,
      ),
    );
    const entity = await this.toEntity(StoreOfferDetailsEntity, result);
    entity.offer = await this.toOffer(entity.offer);
    entity.siblingOffers = await Promise.all(entity.siblingOffers.map((offer) => this.toOffer(offer)));
    return entity;
  }
  private toOffer(offer: StoreOfferEntity): Promise<StoreOfferEntity> {
    return this.toEntity(StoreOfferEntity, StoreOfferMapper.toOffer(offer, this.config.getGatewayUrl()));
  }
  private async toEntity<T extends object>(type: ClassConstructor<T>, result: unknown): Promise<T> {
    const entity = plainToInstance(type, result, { excludeExtraneousValues: true });
    await validateOrReject(entity);
    return entity;
  }
}

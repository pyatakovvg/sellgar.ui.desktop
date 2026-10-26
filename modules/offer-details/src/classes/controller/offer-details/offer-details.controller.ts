import { Controller, Inject, isHttpException } from '@sellgar/app';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { StoreServiceInterface } from '@library/domain';
import { OfferDetailsControllerInterface } from './offer-details-controller.interface.ts';
import { OfferDetailsResultEntity } from './domain/offer-details-result.entity.ts';
@Controller()
export class OfferDetailsController implements OfferDetailsControllerInterface {
  constructor(@Inject(StoreServiceInterface) private readonly storeService: StoreServiceInterface) {}
  async loader(args: Parameters<OfferDetailsControllerInterface['loader']>[0]): Promise<OfferDetailsResultEntity> {
    if (typeof args.params.uuid !== 'string') throw new Error('Не задан идентификатор предложения');
    try {
      const result = await this.storeService.findOfferByUuid(args.params.uuid, args.signal);
      return this.toResult({ offer: result.offer, siblingOffers: result.siblingOffers, failedToLoad: false });
    } catch (error) {
      if (args.signal?.aborted) throw error;
      if (isHttpException(error) && error.status === 404) {
        return this.toResult({ offer: null, siblingOffers: [], failedToLoad: false });
      }
      console.error('Unable to load storefront offer', error);
      return this.toResult({ offer: null, siblingOffers: [], failedToLoad: true });
    }
  }
  private async toResult(value: OfferDetailsResultEntity): Promise<OfferDetailsResultEntity> {
    const result = plainToInstance(OfferDetailsResultEntity, value);
    await validateOrReject(result);
    return instanceToPlain(result) as OfferDetailsResultEntity;
  }
}

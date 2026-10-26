import type { ControllerArgs, RuntimeController, WithParams } from '@sellgar/app';
import type { OfferDetailsResultEntity } from './domain/offer-details-result.entity.ts';
export abstract class OfferDetailsControllerInterface implements RuntimeController {
  abstract loader(args: ControllerArgs<WithParams<{ uuid: string }>>): Promise<OfferDetailsResultEntity>;
}

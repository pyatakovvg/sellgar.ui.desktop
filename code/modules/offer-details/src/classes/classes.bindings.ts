import { BindingModuleInterface, type BindingRegistryInterface } from '@sellgar/app';

import { OfferDetailsController } from './controller/offer-details/offer-details.controller';
import { OfferDetailsControllerInterface } from './controller/offer-details/offer-details-controller.interface';

export class OfferDetailsBindings implements BindingModuleInterface {
  register(registry: BindingRegistryInterface): void {
    registry.bind(OfferDetailsControllerInterface).to(OfferDetailsController).inSingletonScope();
  }
}

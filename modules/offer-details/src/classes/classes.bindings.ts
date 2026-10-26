import { BindingModuleInterface, type BindingRegistryInterface } from '@sellgar/app';
import { OfferDetailsControllerInterface } from './controller/offer-details/offer-details-controller.interface';
import { OfferDetailsController } from './controller/offer-details/offer-details.controller';
export class OfferDetailsBindings implements BindingModuleInterface {
  register(registry: BindingRegistryInterface): void {
    registry.bind(OfferDetailsControllerInterface).to(OfferDetailsController).inSingletonScope();
  }
}

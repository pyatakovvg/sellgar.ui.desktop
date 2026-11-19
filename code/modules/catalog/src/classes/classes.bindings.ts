import { BindingModuleInterface, type BindingRegistryInterface } from '@sellgar/app';

import { CatalogController } from './controller/catalog/catalog.controller';
import { CatalogControllerInterface } from './controller/catalog/catalog-controller.interface';

export class CatalogBindings implements BindingModuleInterface {
  register(registry: BindingRegistryInterface): void {
    registry.bind(CatalogControllerInterface).to(CatalogController).inSingletonScope();
  }
}

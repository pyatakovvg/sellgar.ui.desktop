import { BindingModuleInterface, type BindingRegistryInterface } from '@sellgar/app';
import { CatalogControllerInterface } from './controller/catalog/catalog-controller.interface';
import { CatalogController } from './controller/catalog/catalog.controller';
export class CatalogBindings implements BindingModuleInterface {
  register(registry: BindingRegistryInterface): void {
    registry.bind(CatalogControllerInterface).to(CatalogController).inSingletonScope();
  }
}

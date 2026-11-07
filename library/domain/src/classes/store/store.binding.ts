import { BindingModuleInterface, type BindingRegistryInterface } from '@sellgar/app';

import { StoreService } from './application/store.service.ts';
import { StoreServiceInterface } from './application/store-service.interface.ts';
import { StoreGateway } from './data/gateway/store.gateway.ts';
import { StoreGatewayInterface } from './data/gateway/store-gateway.interface.ts';

export class StoreBinding extends BindingModuleInterface {
  register(registry: BindingRegistryInterface): void {
    registry.bind(StoreGatewayInterface).to(StoreGateway);
    registry.bind(StoreServiceInterface).to(StoreService);
  }
}

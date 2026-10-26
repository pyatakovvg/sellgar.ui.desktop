import { BindingModuleInterface, type BindingRegistryInterface } from '@sellgar/app';
import { StoreServiceInterface } from './application/store-service.interface.ts';
import { StoreService } from './application/store.service.ts';
import { StoreGatewayInterface } from './data/gateway/store-gateway.interface.ts';
import { StoreGateway } from './data/gateway/store.gateway.ts';
export class StoreBinding extends BindingModuleInterface {
  register(registry: BindingRegistryInterface): void {
    registry.bind(StoreGatewayInterface).to(StoreGateway);
    registry.bind(StoreServiceInterface).to(StoreService);
  }
}

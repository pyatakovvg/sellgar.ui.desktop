import { BindingModuleInterface, type BindingRegistryInterface } from '@sellgar/app';

import { CartService } from './application/cart.service.ts';
import { CartServiceInterface } from './application/cart-service.interface.ts';
import { CartGateway } from './data/gateway/cart.gateway.ts';
import { CartGatewayInterface } from './data/gateway/cart-gateway.interface.ts';

export class CartBinding extends BindingModuleInterface {
  register(registry: BindingRegistryInterface): void {
    registry.bind(CartServiceInterface).to(CartService);
    registry.bind(CartGatewayInterface).to(CartGateway);
  }
}

import { BindingModuleInterface, type BindingRegistryInterface } from '@sellgar/app';

import { ConfigBinding } from '../infrastructure/config/config.binding.ts';
import { DeviceServiceInterface } from '../infrastructure/device/device-service.interface.ts';
import { HttpClientBinding } from '../infrastructure/http-client/http-client.binding.ts';
import { CartBinding } from './cart/cart.binding.ts';
import { StoreBinding } from './store/store.binding.ts';

export class DomainBinding extends BindingModuleInterface {
  constructor(
    private readonly gatewayUrl: string,
    private readonly device: DeviceServiceInterface,
    private readonly socketGatewayUrl: string,
    private readonly sessionHeaders: Readonly<Record<string, string>> = {},
    private readonly publicGatewayUrl: string = gatewayUrl,
  ) {
    super();
  }

  register(registry: BindingRegistryInterface): void {
    registry.bind(DeviceServiceInterface).toConstantValue(this.device);
    new ConfigBinding(this.gatewayUrl, this.socketGatewayUrl, this.publicGatewayUrl).register(registry);
    new HttpClientBinding(this.sessionHeaders).register(registry);
    new StoreBinding().register(registry);
    new CartBinding().register(registry);
  }
}

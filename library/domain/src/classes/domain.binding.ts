import { BindingModuleInterface, type BindingRegistryInterface } from '@sellgar/app';
import { ConfigBinding } from '../infrastructure/config/config.binding.ts';
import { HttpClientBinding } from '../infrastructure/http-client/http-client.binding.ts';
import { StoreBinding } from './store/store.binding.ts';
export class DomainBinding extends BindingModuleInterface {
  constructor(private readonly gatewayUrl: string) {
    super();
  }
  register(registry: BindingRegistryInterface): void {
    new ConfigBinding(this.gatewayUrl).register(registry);
    new HttpClientBinding().register(registry);
    new StoreBinding().register(registry);
  }
}

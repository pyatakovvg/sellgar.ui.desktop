import { BindingModuleInterface, type BindingRegistryInterface } from '@sellgar/app';
import { HttpClientInterface } from './http-client.interface.ts';
import { HttpClient } from './http.client.ts';
export class HttpClientBinding extends BindingModuleInterface {
  register(registry: BindingRegistryInterface): void {
    registry.bind(HttpClientInterface).to(HttpClient);
  }
}

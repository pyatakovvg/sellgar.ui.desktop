import { BindingModuleInterface, type BindingRegistryInterface } from '@sellgar/app';

import { HttpClient } from './http.client.ts';
import { HttpClientInterface } from './http-client.interface.ts';

export class HttpClientBinding extends BindingModuleInterface {
  register(registry: BindingRegistryInterface): void {
    registry.bind(HttpClientInterface).to(HttpClient);
  }
}

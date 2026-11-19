import { BindingModuleInterface, type BindingRegistryInterface } from '@sellgar/app';

import { HttpClient } from './http.client.ts';
import { HttpClientInterface } from './http-client.interface.ts';
import { HttpSessionContextInterface } from './http-session-context.interface';

export class HttpClientBinding extends BindingModuleInterface {
  constructor(private readonly headers: Readonly<Record<string, string>> = {}) {
    super();
  }

  register(registry: BindingRegistryInterface): void {
    registry.bind(HttpSessionContextInterface).toConstantValue({ getHeaders: () => this.headers });
    registry.bind(HttpClientInterface).to(HttpClient);
  }
}

import { BindingModuleInterface, type BindingRegistryInterface } from '@sellgar/app';

import { ConfigInterface } from './config.interface.ts';
import { Config } from './config.ts';

export class ConfigBinding extends BindingModuleInterface {
  constructor(
    private readonly gatewayUrl: string,
    private readonly socketGatewayUrl: string,
    private readonly publicGatewayUrl: string = gatewayUrl,
  ) {
    super();
  }

  register(registry: BindingRegistryInterface): void {
    registry
      .bind(ConfigInterface)
      .toConstantValue(new Config(this.gatewayUrl, this.socketGatewayUrl, this.publicGatewayUrl));
  }
}

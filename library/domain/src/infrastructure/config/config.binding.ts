import { BindingModuleInterface, type BindingRegistryInterface } from '@sellgar/app';
import { ConfigInterface } from './config.interface.ts';
import { Config } from './config.ts';
export class ConfigBinding extends BindingModuleInterface {
  constructor(private readonly gatewayUrl: string) {
    super();
  }
  register(registry: BindingRegistryInterface): void {
    registry.bind(ConfigInterface).toConstantValue(new Config(this.gatewayUrl));
  }
}

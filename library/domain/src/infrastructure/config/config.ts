import { ConfigInterface } from './config.interface.ts';
export class Config implements ConfigInterface {
  constructor(private readonly gatewayUrl: string) {}
  getGatewayUrl(): string {
    return this.gatewayUrl;
  }
}

import { ConfigInterface } from './config.interface.ts';

export class Config implements ConfigInterface {
  constructor(
    private readonly gatewayUrl: string,
    private readonly socketGatewayUrl: string,
    private readonly publicGatewayUrl: string = gatewayUrl,
  ) {}

  getSocketGatewayUrl(): string {
    return this.socketGatewayUrl;
  }

  getPublicGatewayUrl(): string {
    return this.publicGatewayUrl;
  }

  getGatewayUrl(): string {
    return this.gatewayUrl;
  }
}

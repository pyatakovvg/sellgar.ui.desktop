import { ConfigInterface } from './config.interface.ts';

export class Config implements ConfigInterface {
  constructor(
    private readonly gatewayUrl: string,
    private readonly socketGatewayUrl: string,
  ) {}

  getSocketGatewayUrl(): string {
    return this.socketGatewayUrl;
  }

  getGatewayUrl(): string {
    return this.gatewayUrl;
  }
}

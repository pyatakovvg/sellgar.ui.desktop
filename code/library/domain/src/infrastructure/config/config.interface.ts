export abstract class ConfigInterface {
  abstract getGatewayUrl(): string;

  abstract getPublicGatewayUrl(): string;

  abstract getSocketGatewayUrl(): string;
}

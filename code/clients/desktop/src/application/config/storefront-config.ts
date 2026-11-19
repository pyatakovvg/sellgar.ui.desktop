export interface StorefrontConfig {
  readonly clientGatewayUrl: string;
  readonly socketGatewayUrl: string;
}

export function parseStorefrontConfig(input: unknown): StorefrontConfig {
  if (typeof input !== 'object' || input === null) throw new Error('Missing storefront configuration.');

  const config = input as Partial<StorefrontConfig>;

  for (const key of ['clientGatewayUrl', 'socketGatewayUrl'] as const) {
    const value = config[key];

    if (typeof value !== 'string') throw new Error(`Missing storefront configuration: ${key}`);

    const url = new URL(value);

    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
      throw new Error(`Invalid storefront configuration: ${key}`);
    }
  }

  return { clientGatewayUrl: config.clientGatewayUrl!, socketGatewayUrl: config.socketGatewayUrl! };
}

export function readStorefrontConfig(): StorefrontConfig {
  return parseStorefrontConfig({
    clientGatewayUrl: process.env.PUBLIC_CLIENT_GATEWAY_URL ?? 'http://localhost:4030',
    socketGatewayUrl: process.env.PUBLIC_SOCKET_GATEWAY_URL ?? 'http://localhost:4040',
  });
}

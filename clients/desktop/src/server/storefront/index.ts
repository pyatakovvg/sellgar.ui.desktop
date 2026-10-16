import { StorefrontGateway } from './storefront.gateway.ts';

export const storefrontGateway = new StorefrontGateway(
  process.env.CLIENT_GATEWAY_URL ?? process.env.NEXT_PUBLIC_CLIENT_GATEWAY_URL ?? 'http://localhost:4030',
);

/** Resolve an API resource relative to the configured gateway prefix. */
export function resolveGatewayUrl(path: string, gatewayUrl: string): URL {
  return new URL(path.replace(/^\//, ''), `${gatewayUrl.replace(/\/$/, '')}/`);
}

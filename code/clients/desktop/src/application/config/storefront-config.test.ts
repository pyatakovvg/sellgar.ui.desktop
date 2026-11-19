import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { parseStorefrontConfig, readStorefrontConfig } from './storefront-config';
import { StorefrontConfigState } from './storefront-config.state';

const previous = {
  client: process.env.PUBLIC_CLIENT_GATEWAY_URL,
  socket: process.env.PUBLIC_SOCKET_GATEWAY_URL,
};

afterEach(() => {
  for (const [key, value] of Object.entries({
    PUBLIC_CLIENT_GATEWAY_URL: previous.client,
    PUBLIC_SOCKET_GATEWAY_URL: previous.socket,
  })) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test('reads configuration at runtime and transfers only public fields through the application snapshot', () => {
  process.env.PUBLIC_CLIENT_GATEWAY_URL = 'https://first.invalid';
  process.env.PUBLIC_SOCKET_GATEWAY_URL = 'https://socket.invalid';
  const first = readStorefrontConfig();

  process.env.PUBLIC_CLIENT_GATEWAY_URL = 'https://second.invalid';
  assert.equal(readStorefrontConfig().clientGatewayUrl, 'https://second.invalid');

  const state = new StorefrontConfigState(first);
  const serialized = state.serialize();
  const restored = StorefrontConfigState.deserialize({ ...serialized, secret: 'must-not-transfer' });

  assert.deepEqual(restored, first);
  assert.equal('secret' in restored, false);
  state.hydrate(restored);
  assert.deepEqual(state.getSnapshot(), first);
});

test('rejects missing configuration and URLs with credentials or unsafe protocols', () => {
  for (const input of [
    undefined,
    {},
    { clientGatewayUrl: 'file:///etc/passwd', socketGatewayUrl: 'https://socket.invalid' },
    { clientGatewayUrl: 'https://user:password@api.invalid', socketGatewayUrl: 'https://socket.invalid' },
  ]) {
    assert.throws(() => parseStorefrontConfig(input));
  }
});

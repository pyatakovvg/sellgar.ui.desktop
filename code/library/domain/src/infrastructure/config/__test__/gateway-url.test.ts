import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveGatewayUrl } from '../gateway-url.ts';

test('preserves external gateway prefix for API requests and images', () => {
  assert.equal(
    resolveGatewayUrl('/v1/cart', 'http://dev.sellgar.io/api/client').href,
    'http://dev.sellgar.io/api/client/v1/cart',
  );
  assert.equal(
    resolveGatewayUrl('/v1/files/image', 'http://dev.sellgar.io/api/client/').href,
    'http://dev.sellgar.io/api/client/v1/files/image',
  );
});

test('keeps direct service origins and absolute image URLs', () => {
  assert.equal(resolveGatewayUrl('/v1/cart', 'http://client-gateway:4030').href, 'http://client-gateway:4030/v1/cart');
  assert.equal(
    resolveGatewayUrl('https://cdn.example/image', 'http://dev.sellgar.io/api/client').href,
    'https://cdn.example/image',
  );
});

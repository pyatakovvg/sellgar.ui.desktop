import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { afterEach, mock, test } from 'node:test';

// Next's bundler resolves this extensionless subpath; Node's test runtime needs the file extension.
const resolution = registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(specifier === 'next/server' ? 'next/server.js' : specifier, context);
  },
});
const { NextRequest } = await import('next/server');
const { proxy } = await import('../../proxy');

resolution.deregister();

afterEach(() => mock.restoreAll());

test('prepares a guest for the same SSR request and preserves every gateway cookie on the response', async () => {
  const publicSession = {
    sessionUuid: '00000000-0000-4000-8000-000000000001',
    userUuid: null,
    expiresAt: '2099-01-01T00:00:00Z',
  };
  let upstreamHeaders: Headers | undefined;

  mock.method(globalThis, 'fetch', async (_url: URL, options: RequestInit) => {
    upstreamHeaders = new Headers(options.headers);
    const response = Response.json(publicSession);

    response.headers.append('set-cookie', 'session=issued-secret; HttpOnly; Path=/');
    response.headers.append('set-cookie', 'refresh=issued-refresh; HttpOnly; Path=/');

    return response;
  });
  const response = await proxy(
    new NextRequest('http://localhost:3100/offers/test', {
      headers: { 'user-agent': 'ssr-test', 'x-sellgar-session': '{"spoofed":true}', cookie: 'preference=light' },
    }),
  );
  const device = response.cookies.get('sellgar.deviceUuid')?.value;

  assert.ok(device);
  assert.equal(upstreamHeaders?.get('x-device-id'), device);
  assert.equal(upstreamHeaders?.get('user-agent'), 'ssr-test');
  assert.deepEqual(JSON.parse(response.headers.get('x-middleware-request-x-sellgar-session')!), publicSession);
  const forwardedCookies = response.headers.get('x-middleware-request-cookie')!;

  assert.match(forwardedCookies, /session=issued-secret/);
  assert.match(forwardedCookies, /refresh=issued-refresh/);
  assert.match(forwardedCookies, /preference=light/);
  const issuedCookies = response.headers.getSetCookie();

  assert.equal(issuedCookies.length, 3);
  assert.ok(issuedCookies.some((cookie) => cookie.startsWith('session=issued-secret;')));
  assert.ok(issuedCookies.some((cookie) => cookie.startsWith('refresh=issued-refresh;')));
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
});

test('keeps the existing device and rejects an unavailable session before rendering a personal page', async () => {
  mock.method(globalThis, 'fetch', async (_url: URL, options: RequestInit) => {
    assert.equal(new Headers(options.headers).get('x-device-id'), 'existing-device');

    return Response.json({}, { status: 503 });
  });
  const response = await proxy(
    new NextRequest('http://localhost:3100/', {
      headers: { cookie: 'sellgar.deviceUuid=existing-device' },
    }),
  );

  assert.equal(response.status, 503);
  assert.equal(response.headers.getSetCookie().length, 0);
});

test('gateway transport failure returns 503 without changing visitor cookies', async () => {
  mock.method(globalThis, 'fetch', async () => {
    throw new TypeError('fetch failed');
  });
  const response = await proxy(
    new NextRequest('http://dev.sellgar.io/', {
      headers: { cookie: 'sellgar.deviceUuid=existing-device; session=existing-session' },
    }),
  );

  assert.equal(response.status, 503);
  assert.equal(response.headers.getSetCookie().length, 0);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.match(await response.text(), /Магазин временно недоступен/);
});

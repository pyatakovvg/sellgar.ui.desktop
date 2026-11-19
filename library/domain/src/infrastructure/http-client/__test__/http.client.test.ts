import 'reflect-metadata';

import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';

import { HttpException, NetworkError, NotFoundException } from '@sellgar/app';

import { HttpClient } from '../http.client.ts';

const client = new HttpClient({ getUniqueId: () => 'browser-device' });
const url = new URL('https://gateway.example.test/v1/products');

afterEach(() => mock.restoreAll());
test('transport preserves HTTP status and request source for framework error handling', async () => {
  mock.method(globalThis, 'fetch', async () => new Response('unavailable', { status: 503 }));
  await assert.rejects(
    client.get(url),
    (error) => error instanceof HttpException && error.status === 503 && error.request?.url === url.href,
  );
  mock.method(globalThis, 'fetch', async () => new Response('missing', { status: 404 }));
  await assert.rejects(client.get(url), NotFoundException);
});
test('transport distinguishes network failure from cancellation', async () => {
  mock.method(globalThis, 'fetch', async () => {
    throw new TypeError('network unavailable');
  });
  await assert.rejects(client.get(url), NetworkError);
  const abort = new AbortController();

  abort.abort();
  mock.method(globalThis, 'fetch', async () => {
    throw abort.signal.reason;
  });
  await assert.rejects(client.get(url, abort.signal), { name: 'AbortError' });
});

test('forwards request-scoped server credentials only for session requests', async () => {
  const headers = { cookie: 'session=test-credential', 'user-agent': 'test-browser' };
  const scoped = new HttpClient({ getUniqueId: () => 'request-device' }, { getHeaders: () => headers });
  const requests: RequestInit[] = [];

  mock.method(globalThis, 'fetch', async (_url: URL, input: RequestInit) => {
    requests.push(input);

    return Response.json({});
  });

  await scoped.request(url, { method: 'GET', withSession: true });
  await scoped.get(url);
  assert.deepEqual(requests[0].headers, { ...headers, 'x-device-id': 'request-device' });
  assert.equal(requests[0].credentials, 'include');
  assert.deepEqual(requests[1].headers, {});
  assert.equal(requests[1].credentials, 'omit');
});

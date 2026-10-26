import 'reflect-metadata';
import assert from 'node:assert/strict';
import { afterEach, test, mock } from 'node:test';
import { HttpException, NetworkError, NotFoundException } from '@sellgar/app';
import { HttpClient } from '../http.client.ts';
const client = new HttpClient();
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

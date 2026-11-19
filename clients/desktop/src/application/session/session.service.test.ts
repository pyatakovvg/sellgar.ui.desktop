import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, test } from 'node:test';

import { BrowserDeviceService } from '../device/browser-device.service.ts';
import { SessionService } from './session.service.ts';

const descriptors = new Map<string, PropertyDescriptor | undefined>();
let requests: { path: string; options: RequestInit }[];
let serverSession: { sessionUuid: string; userUuid: string | null; expiresAt: string } | undefined;
let guestCreations: number;
let failure: number | undefined;
let failurePath: string | undefined;

function replace(name: string, value: unknown) {
  descriptors.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
}

beforeEach(() => {
  requests = [];
  guestCreations = 0;
  failure = undefined;
  failurePath = undefined;
  serverSession = undefined;
  const storage = new Map<string, string>();
  let lock = Promise.resolve();

  replace('localStorage', {
    getItem: (key: string) => storage.get(key),
    setItem: (key: string, value: string) => storage.set(key, value),
  });

  replace('navigator', {
    locks: {
      request: (_name: string, options: { signal?: AbortSignal }, operation: () => Promise<unknown>) => {
        const next = lock.then(() => {
          options.signal?.throwIfAborted();

          return operation();
        });

        lock = next.then(
          () => undefined,
          () => undefined,
        );

        return next;
      },
    },
  });
  replace('fetch', async (url: URL, options: RequestInit) => {
    const path = url.pathname.split('/').at(-1)!;

    requests.push({ path, options });
    if (failure && (!failurePath || failurePath === path)) return Response.json({}, { status: failure });

    if (path === 'logout') {
      serverSession = undefined;

      return Response.json({ loggedOut: true });
    }

    if (path === 'login')
      serverSession = { sessionUuid: randomUUID(), userUuid: randomUUID(), expiresAt: '2099-01-01T00:00:00.000Z' };

    if (!serverSession) {
      guestCreations++;
      // Yield before assignment so an unprotected concurrent bootstrap would create two guests.
      await Promise.resolve();
      serverSession = { sessionUuid: randomUUID(), userUuid: null, expiresAt: '2099-01-01T00:00:00.000Z' };
    }

    return Response.json(serverSession);
  });
});

afterEach(() => {
  for (const [name, descriptor] of descriptors) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else Reflect.deleteProperty(globalThis, name);
  }
  descriptors.clear();
});

test('parallel application instances share a device binding while session credentials stay in cookies', async () => {
  const first = new SessionService('http://localhost:4030', new BrowserDeviceService());
  const second = new SessionService('http://localhost:4030', new BrowserDeviceService());
  const [a, b] = await Promise.all([first.initialize(), second.initialize()]);

  assert.equal(guestCreations, 1);
  assert.equal(a.sessionUuid, b.sessionUuid);
  assert.equal(a.userUuid, null);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].options.credentials, 'include');
  assert.equal(requests[0].options.body, undefined);
  assert.deepEqual(requests[0].options.headers, requests[1].options.headers);
  assert.equal(Object.keys(requests[0].options.headers!).length, 1);
  assert.ok(Object.hasOwn(requests[0].options.headers!, 'x-device-id'));
  assert.equal(Object.hasOwn(a, 'ownerUuid'), false);
  assert.equal(Object.hasOwn(a, 'sessionSecret'), false);
});

test('failed login keeps the guest context and an outage does not issue a replacement guest', async () => {
  const sessions = new SessionService('http://localhost:4030', new BrowserDeviceService());
  const guest = await sessions.initialize();

  failure = 401;
  await assert.rejects(sessions.login({ login: 'user', password: 'wrong' }));
  assert.equal(sessions.getCurrent(), guest);
  failure = 503;
  await assert.rejects(sessions.initialize());
  assert.equal(sessions.getCurrent(), guest);
  assert.equal(guestCreations, 1);
  assert.equal(requests.length, 3);
});

test('login changes the session and logout establishes a fresh guest instead of restoring the old one', async () => {
  const sessions = new SessionService('http://localhost:4030', new BrowserDeviceService());
  const guest = await sessions.initialize();
  const changed: string[] = [];
  const unsubscribe = sessions.subscribe((session) => changed.push(session?.sessionUuid ?? 'none'));
  const account = await sessions.login({ login: 'user', password: 'password' });
  const freshGuest = await sessions.logout();

  assert.notEqual(account.userUuid, null);
  assert.equal(freshGuest.userUuid, null);
  assert.notEqual(guest.sessionUuid, account.sessionUuid);
  assert.notEqual(guest.sessionUuid, freshGuest.sessionUuid);
  assert.deepEqual(changed, [account.sessionUuid, 'none', freshGuest.sessionUuid]);
  assert.deepEqual(
    requests.map((request) => request.path),
    ['session', 'login', 'logout', 'session'],
  );
  unsubscribe();
});

test('an aborted initializer does not create a session', async () => {
  const sessions = new SessionService('http://localhost:4030', new BrowserDeviceService());
  const abort = new AbortController();

  abort.abort();
  await assert.rejects(sessions.initialize(abort.signal));
  assert.equal(requests.length, 0);
});

test('successful logout clears account state even if the subsequent guest bootstrap is unavailable', async () => {
  const sessions = new SessionService('http://localhost:4030', new BrowserDeviceService());

  await sessions.initialize();
  await sessions.login({ login: 'user', password: 'password' });
  failure = 503;
  failurePath = 'session';
  await assert.rejects(sessions.logout());
  assert.equal(sessions.getCurrent(), undefined);
  failure = undefined;
  const guest = await sessions.initialize();

  assert.equal(guest.userUuid, null);
});

test('restores the public server session before startup without a second bootstrap request', async () => {
  const sessions = new SessionService('http://localhost:4030', new BrowserDeviceService());
  const prepared = { sessionUuid: randomUUID(), userUuid: null, expiresAt: '2099-01-01T00:00:00.000Z' };

  replace('document', { addEventListener() {}, removeEventListener() {} });
  replace(
    'BroadcastChannel',
    class {
      close() {}
    },
  );
  sessions.hydrate({ ...prepared, sessionSecret: 'must-not-be-retained' });
  const dispose = await sessions.start(new AbortController().signal);

  assert.deepEqual(sessions.getCurrent(), prepared);
  assert.equal(requests.length, 0);
  dispose();
  assert.throws(() => sessions.hydrate({ sessionUuid: 'invalid' }), /Invalid session/);
});

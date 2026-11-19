import 'reflect-metadata';

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { type BindingRegistryInterface, UseBindings } from '@sellgar/app';
import { Application, type ApplicationConfiguratorInterface } from '@sellgar/app/next';

import { CartEntity, CartItemEntity, type CartServiceInterface } from '@library/domain';
import { SessionContextInterface } from '@library/session';

import { CartApplicationState } from '../cart.state';
import { CartApplicationProvider } from '../cart-application.provider';
import { CartWidgetServiceInterface } from '../cart-service.interface';
import { CartChangesHubInterface } from '../classes/hub/cart-changes/cart-changes-hub.interface';
import { CartWidgetService } from '../classes/service/cart/cart.service';
import { CartStore } from '../classes/store/cart/cart.store';

const uuid = '00000000-0000-4000-8000-000000000001';
const cart = (quantity: number, version = '1') =>
  Object.assign(new CartEntity(), {
    uuid,
    version,
    currencyCode: 'RUB',
    itemsTotal: '0.00',
    shop: { uuid, name: 'Shop' },
    items: quantity
      ? [
          Object.assign(new CartItemEntity(), {
            recordUuid: uuid,
            quantity,
            version,
            offerUuid: uuid,
            productUuid: uuid,
            variantUuid: uuid,
            productName: 'Product',
            variantName: 'Variant',
            article: 'TEST',
            clarifications: [],
            imageUuid: uuid,
            imageUrl: `http://localhost:4030/v1/files/${uuid}`,
            availableQuantity: 10,
            price: null,
            subtotal: null,
            reasons: [],
            message: null,
            canCheckout: true,
            canOpenProduct: true,
            canIncrease: true,
            canDecrease: true,
            canRemove: true,
          }),
        ]
      : [],
  });

const setup = () => {
  const state = new CartStore();
  let reads = 0;
  let subscriptions = 0;
  let hubDisposed = 0;
  let sessionDisposed = 0;
  let updated: ((cart: CartEntity) => void | Promise<void>) | undefined;
  let finishRead!: (value: CartEntity) => void;
  let failRead!: (error: Error) => void;
  let readStarted!: () => void;
  const reading = new Promise<void>((resolve) => {
    readStarted = resolve;
  });
  const domain: CartServiceInterface = {
    get: () => {
      reads++;
      readStarted();

      return new Promise((resolve, reject) => {
        finishRead = resolve;
        failRead = reject;
      });
    },
    addItem: async () => {
      await updated?.(cart(1, '2'));

      return { cartUuid: uuid, recordUuid: uuid, quantity: 1, cartVersion: '2' };
    },
    setItemQuantity: async () => {
      throw new Error('Unused');
    },
    removeItem: async () => {
      throw new Error('Unused');
    },
  };
  const service = new CartWidgetService(domain, state);

  class TestBindings {
    register(registry: BindingRegistryInterface) {
      registry.bind(CartApplicationState).toSelf().inSingletonScope();
      registry.bind(CartStore).toConstantValue(state);
      registry.bind(CartWidgetService).toConstantValue(service);
      registry.bind(CartWidgetServiceInterface).toService(CartWidgetService);
      registry.bind(CartChangesHubInterface).toConstantValue({
        subscribe: (handler) => {
          subscriptions++;
          updated = handler;

          return async () => {
            hubDisposed++;
          };
        },
      });
      registry.bind(SessionContextInterface).toConstantValue({
        getCurrent: () => ({ sessionUuid: uuid, userUuid: null, expiresAt: '2099-01-01T00:00:00.000Z' }),
        subscribe: () => () => {
          sessionDisposed++;
        },
        issueSocketTicket: async () => {
          throw new Error('Unused');
        },
      });
    }
  }

  @UseBindings(TestBindings)
  class TestApplication extends Application {
    protected configure(config: ApplicationConfiguratorInterface) {
      config.states([CartApplicationState]);
      config.providers([CartApplicationProvider]);
    }
  }

  const app = new TestApplication();

  return {
    app,
    service,
    state,
    reading,
    failRead: (error: Error) => failRead(error),
    finishRead: (value: CartEntity) => finishRead(value),
    getReads: () => reads,
    getSubscriptions: () => subscriptions,
    getDisposals: () => [hubDisposed, sessionDisposed],
    update: (value: CartEntity) => updated?.(value),
  };
};

test('application preloads Cart once before ready, exposes shared state and commands, and retains subscriptions until shutdown', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');

  Object.defineProperty(globalThis, 'window', { value: {}, configurable: true });

  const runtime = setup();

  try {
    runtime.app.compose();
    const starting = Promise.all([runtime.app.initialize(), runtime.app.initialize()]);

    await runtime.reading;
    assert.equal(runtime.app.lifecycle.phase, 'initializing');
    runtime.finishRead(cart(0));
    await starting;
    assert.equal(runtime.app.lifecycle.phase, 'ready');
    const firstConsumer = runtime.app.getDependency(CartWidgetServiceInterface);
    const secondConsumer = runtime.app.getDependency(CartWidgetServiceInterface);

    assert.equal(firstConsumer, runtime.service);
    assert.equal(secondConsumer, firstConsumer);
    const quantities: number[] = [];
    const unsubscribe = secondConsumer.subscribe(() => {
      quantities.push(secondConsumer.getSnapshot().cart?.items[0]?.quantity ?? 0);
    });

    await firstConsumer.setQuantity(uuid, 1, new AbortController().signal);
    assert.equal(secondConsumer.getSnapshot().cart?.items[0]?.quantity, 1);
    assert.ok(quantities.includes(1));
    unsubscribe();
    // Releasing a page's observation does not release the application widget.
    await runtime.update(cart(3, '3'));
    assert.equal(firstConsumer.getSnapshot().cart?.items[0]?.quantity, 3);
    await runtime.app.initialize();
    assert.equal(runtime.getReads(), 1);
    assert.equal(runtime.getSubscriptions(), 1);
    assert.deepEqual(runtime.getDisposals(), [0, 0]);
  } finally {
    await runtime.app.dispose();
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
    else Reflect.deleteProperty(globalThis, 'window');
  }
  assert.deepEqual(runtime.getDisposals(), [1, 1]);
});

test('SSR prepares the Cart before ready; the browser restores it without a GET and applications isolate state', async () => {
  const first = setup();
  const second = setup();
  const browser = setup();
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');

  try {
    first.app.compose();
    second.app.compose();
    const starting = Promise.all([first.app.initialize(), second.app.initialize()]);

    await Promise.all([first.reading, second.reading]);
    assert.equal(first.app.lifecycle.phase, 'initializing');
    first.finishRead(cart(2));
    second.finishRead(cart(0));
    await starting;
    assert.equal(first.getReads(), 1);
    assert.equal(first.getSubscriptions(), 0);
    assert.equal(second.getReads(), 1);
    assert.equal(second.getSubscriptions(), 0);
    assert.notEqual(first.service, second.service);
    assert.equal(second.service.getSnapshot().cart?.items.length, 0);
    const serialized = JSON.parse(JSON.stringify(first.app.getDependency(CartApplicationState).serialize()));

    Object.defineProperty(globalThis, 'window', { value: {}, configurable: true });
    browser.app.compose();
    browser.app.getDependency(CartApplicationState).hydrate(CartApplicationState.deserialize(serialized));
    await browser.app.initialize();
    assert.equal(browser.getReads(), 0);
    assert.equal(browser.getSubscriptions(), 1);
    assert.equal(browser.service.getSnapshot().cart?.items[0]?.quantity, 2);
    assert.equal(browser.service.getSnapshot().cart?.items[0]?.imageUrl, `http://localhost:4030/v1/files/${uuid}`);
  } finally {
    await Promise.all([first.app.dispose(), second.app.dispose(), browser.app.dispose()]);
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});

test('failed Cart preparation prevents application readiness and never activates socket subscriptions', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');

  Object.defineProperty(globalThis, 'window', { value: {}, configurable: true });

  const runtime = setup();

  try {
    runtime.app.compose();
    const starting = runtime.app.initialize();
    const failed = assert.rejects(starting, /Cart bootstrap unavailable/);

    await runtime.reading;
    runtime.failRead(new Error('Cart bootstrap unavailable'));
    await failed;
    assert.equal(runtime.app.lifecycle.phase, 'failed');
    assert.equal(runtime.getSubscriptions(), 0);
    assert.equal(runtime.service.getSnapshot().loaded, false);
  } finally {
    await runtime.app.dispose();
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});

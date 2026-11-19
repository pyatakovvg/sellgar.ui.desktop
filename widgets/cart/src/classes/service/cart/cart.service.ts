import { Inject, Injectable, isHttpException } from '@sellgar/app';

import { type CartItemMutationEntity, CartServiceInterface } from '@library/domain';

import { CartWidgetServiceInterface } from '../../../cart-service.interface';
import { CartStore } from '../../store/cart/cart.store';

@Injectable()
export class CartWidgetService extends CartWidgetServiceInterface {
  private sessionRequests = new AbortController();

  constructor(
    @Inject(CartServiceInterface) private readonly carts: CartServiceInterface,
    @Inject(CartStore) private readonly state: CartStore,
  ) {
    super();
  }

  getSnapshot = () => this.state.getSnapshot();

  subscribe = (listener: () => void) => this.state.subscribe(listener);

  clearCart(): void {
    this.sessionRequests.abort();
    this.sessionRequests = new AbortController();
    this.state.clear();
  }

  dispose(): void {
    this.sessionRequests.abort();
  }

  loadCart(operationSignal: AbortSignal): Promise<void> {
    return this.readCart(AbortSignal.any([operationSignal, this.sessionRequests.signal]));
  }

  async setQuantity(recordUuid: string, quantity: number, operationSignal?: AbortSignal): Promise<void> {
    if (this.state.getSnapshot().busy) throw new Error('Дождитесь завершения изменения корзины.');

    const sessionSignal = this.sessionRequests.signal;
    const signal = operationSignal ? AbortSignal.any([operationSignal, sessionSignal]) : sessionSignal;

    const item = this.state.getSnapshot().cart?.items.find((entry) => entry.recordUuid === recordUuid);

    this.state.begin(recordUuid, quantity < (item?.quantity ?? 0) ? 'decrease' : 'increase');

    try {
      const result =
        quantity === 0 && item
          ? await this.carts.removeItem(recordUuid, item.version, signal)
          : item
            ? await this.carts.setItemQuantity(recordUuid, { quantity, version: item.version }, signal)
            : await this.carts.addItem({ recordUuid, quantity }, signal);

      signal.throwIfAborted();
      await this.waitForCart(result, signal);

      this.state.finish();

      return;
    } catch (error) {
      if (signal.aborted) throw error;

      const failure = this.describeFailure(error);

      this.state.finish(failure);
      throw failure;
    } finally {
      if (
        !sessionSignal.aborted &&
        this.state.getSnapshot().busy &&
        this.state.getSnapshot().activeRecordUuid === recordUuid
      )
        this.state.finish();
    }
  }

  private describeFailure(error: unknown): Error {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      return new Error(
        'Изменение сохранено, но обновление корзины задерживается. Дождитесь восстановления соединения.',
        { cause: error },
      );
    }

    if (isHttpException(error) && error.status === 409) {
      return new Error('Количество изменилось или товар недоступен. Обновите страницу и попробуйте снова.', {
        cause: error,
      });
    }

    if (isHttpException(error) && error.status === 401) {
      return new Error('Сессия завершена. Обновите страницу и попробуйте снова.', { cause: error });
    }

    return new Error('Не удалось изменить количество в корзине. Попробуйте ещё раз.', { cause: error });
  }

  private waitForCart(result: CartItemMutationEntity, operationSignal: AbortSignal): Promise<void> {
    const signal = AbortSignal.any([operationSignal, AbortSignal.timeout(10000)]);

    return new Promise((resolve, reject) => {
      const cleanup = () => {
        unsubscribe();
        signal.removeEventListener('abort', aborted);
      };
      const changed = () => {
        const cart = this.state.getSnapshot().cart;

        if (cart?.uuid === result.cartUuid && BigInt(cart.version) >= BigInt(result.cartVersion)) {
          cleanup();
          resolve();
        }
      };
      const aborted = () => {
        cleanup();
        reject(signal.reason);
      };
      const unsubscribe = this.state.subscribe(changed);

      signal.addEventListener('abort', aborted, { once: true });
      if (signal.aborted) aborted();
      else changed();
    });
  }

  private async readCart(signal: AbortSignal): Promise<void> {
    try {
      const cart = await this.carts.get(signal);

      signal.throwIfAborted();
      this.state.load(cart);
    } catch (error) {
      if (signal.aborted) throw error;

      this.state.failToLoad();
      throw error;
    }
  }
}

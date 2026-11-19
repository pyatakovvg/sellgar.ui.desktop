import { Injectable } from '@sellgar/app';

import { CartEntity } from '@library/domain';

import type { CartSnapshot } from '../../../cart-service.interface';

@Injectable()
export class CartStore {
  private snapshot: CartSnapshot = {
    cart: null,
    loaded: false,
    failedToLoad: false,
    pendingAction: null,
    activeRecordUuid: null,
    busy: false,
    error: null,
  };

  private readonly listeners = new Set<() => void>();

  getSnapshot = (): CartSnapshot => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  };

  clear(): void {
    this.publish({
      cart: null,
      loaded: false,
      failedToLoad: false,
      activeRecordUuid: null,
      pendingAction: null,
      busy: false,
      error: null,
    });
  }

  load(cart: CartEntity): void {
    const previous = this.snapshot.cart;

    if (previous?.uuid === cart.uuid && BigInt(previous.version) > BigInt(cart.version)) return;

    this.publish({
      cart,
      loaded: true,
      failedToLoad: false,
    });
  }

  failToLoad(): void {
    this.publish({ loaded: false, failedToLoad: true });
  }

  begin(recordUuid: string, pendingAction: 'increase' | 'decrease'): void {
    this.publish({ activeRecordUuid: recordUuid, pendingAction, busy: true, error: null });
  }

  finish(error: Error | null = null): void {
    this.publish({
      activeRecordUuid: error ? this.snapshot.activeRecordUuid : null,
      busy: false,
      pendingAction: null,
      error,
    });
  }

  private publish(update: Partial<CartSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...update };
    for (const listener of this.listeners) listener();
  }
}

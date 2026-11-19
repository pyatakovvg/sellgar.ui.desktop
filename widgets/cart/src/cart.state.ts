import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { Inject, Injectable } from '@sellgar/app';
import { ApplicationStateInterface } from '@sellgar/app/next';

import { CartEntity } from '@library/domain';

import type { CartSnapshot } from './cart-service.interface';
import { CartStore } from './classes/store/cart/cart.store';

@Injectable()
export class CartApplicationState extends ApplicationStateInterface<CartSnapshot> {
  static readonly key = 'cart';

  static deserialize(input: unknown): CartSnapshot {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Missing prepared Cart state.');

    const cart = plainToInstance(CartEntity, input, { excludeExtraneousValues: true });

    if (validateSync(cart).length) throw new Error('Invalid prepared Cart state.');

    return {
      cart,
      loaded: true,
      failedToLoad: false,
      busy: false,
      activeRecordUuid: null,
      pendingAction: null,
      error: null,
    };
  }

  constructor(@Inject(CartStore) private readonly state: CartStore) {
    super();
  }

  getSnapshot = () => this.state.getSnapshot();

  subscribe = (listener: () => void) => this.state.subscribe(listener);

  hydrate(snapshot: CartSnapshot): void {
    if (!snapshot.cart) throw new Error('Cart must be prepared before hydration.');

    this.state.load(snapshot.cart);
  }

  serialize(): unknown {
    const snapshot = this.state.getSnapshot();

    if (!snapshot.loaded || !snapshot.cart) throw new Error('Cart must be prepared before rendering.');

    return instanceToPlain(snapshot.cart);
  }
}

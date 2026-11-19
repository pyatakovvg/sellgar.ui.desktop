import { Inject, Injectable } from '@sellgar/app';

import { CartGatewayInterface } from '../data/gateway/cart-gateway.interface.ts';
import type { AddCartItemInput } from '../data/gateway/input/add-cart-item.input.ts';
import type { SetCartItemQuantityInput } from '../data/gateway/input/set-cart-item-quantity.input.ts';
import { CartServiceInterface } from './cart-service.interface.ts';

@Injectable()
export class CartService implements CartServiceInterface {
  constructor(@Inject(CartGatewayInterface) private readonly gateway: CartGatewayInterface) {}

  get(signal?: AbortSignal) {
    return this.gateway.get(signal);
  }

  addItem(input: AddCartItemInput, signal?: AbortSignal) {
    return this.gateway.addItem(input, signal);
  }

  setItemQuantity(recordUuid: string, input: SetCartItemQuantityInput, signal?: AbortSignal) {
    return this.gateway.setItemQuantity(recordUuid, input, signal);
  }

  removeItem(recordUuid: string, version: string, signal?: AbortSignal) {
    return this.gateway.removeItem(recordUuid, version, signal);
  }
}

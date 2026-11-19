import type { AddCartItemInput } from '../data/gateway/input/add-cart-item.input.ts';
import type { SetCartItemQuantityInput } from '../data/gateway/input/set-cart-item-quantity.input.ts';
import type { CartEntity } from '../domain/cart.entity.ts';
import type { CartItemMutationEntity } from '../domain/cart-item-mutation.entity.ts';

export abstract class CartServiceInterface {
  abstract get(signal?: AbortSignal): Promise<CartEntity>;

  abstract addItem(input: AddCartItemInput, signal?: AbortSignal): Promise<CartItemMutationEntity>;

  abstract setItemQuantity(
    recordUuid: string,
    input: SetCartItemQuantityInput,
    signal?: AbortSignal,
  ): Promise<CartItemMutationEntity>;

  abstract removeItem(recordUuid: string, version: string, signal?: AbortSignal): Promise<CartItemMutationEntity>;
}

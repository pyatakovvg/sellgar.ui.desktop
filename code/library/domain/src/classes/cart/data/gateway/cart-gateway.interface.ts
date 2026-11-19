import type { CartEntity } from '../../domain/cart.entity.ts';
import type { CartItemMutationEntity } from '../../domain/cart-item-mutation.entity.ts';
import type { AddCartItemInput } from './input/add-cart-item.input.ts';
import type { SetCartItemQuantityInput } from './input/set-cart-item-quantity.input.ts';

export abstract class CartGatewayInterface {
  abstract get(signal?: AbortSignal): Promise<CartEntity>;

  abstract addItem(input: AddCartItemInput, signal?: AbortSignal): Promise<CartItemMutationEntity>;

  abstract setItemQuantity(
    recordUuid: string,
    input: SetCartItemQuantityInput,
    signal?: AbortSignal,
  ): Promise<CartItemMutationEntity>;

  abstract removeItem(recordUuid: string, version: string, signal?: AbortSignal): Promise<CartItemMutationEntity>;
}

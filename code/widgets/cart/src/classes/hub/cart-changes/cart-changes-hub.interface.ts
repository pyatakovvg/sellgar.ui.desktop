import type { CartEntity } from '@library/domain';

export abstract class CartChangesHubInterface {
  abstract subscribe(changed: (cart: CartEntity) => void | Promise<void>): () => Promise<void>;
}

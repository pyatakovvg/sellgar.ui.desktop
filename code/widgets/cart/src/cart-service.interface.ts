import type { CartEntity } from '@library/domain';

export interface CartSnapshot {
  readonly cart: CartEntity | null;
  readonly loaded: boolean;
  readonly failedToLoad: boolean;
  readonly busy: boolean;
  readonly pendingAction: 'increase' | 'decrease' | null;
  readonly activeRecordUuid: string | null;
  readonly error: Error | null;
}

export abstract class CartWidgetServiceInterface {
  abstract getSnapshot(): CartSnapshot;

  abstract subscribe(listener: () => void): () => void;

  abstract setQuantity(recordUuid: string, quantity: number, signal?: AbortSignal): Promise<void>;
}

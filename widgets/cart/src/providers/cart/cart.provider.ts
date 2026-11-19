import {
  Inject,
  Provider,
  type ProviderActivateContextInterface,
  ProviderInterface,
  type ProviderPrepareContextInterface,
} from '@sellgar/app';

import { SessionContextInterface } from '@library/session';

import { CartChangesHubInterface } from '../../classes/hub/cart-changes/cart-changes-hub.interface';
import { CartWidgetService } from '../../classes/service/cart/cart.service';
import { CartStore } from '../../classes/store/cart/cart.store';

@Provider()
export class CartProvider extends ProviderInterface {
  constructor(
    @Inject(CartWidgetService) private readonly cart: CartWidgetService,
    @Inject(CartChangesHubInterface) private readonly hub: CartChangesHubInterface,
    @Inject(CartStore) private readonly state: CartStore,
    @Inject(SessionContextInterface) private readonly sessions: SessionContextInterface,
  ) {
    super();
  }

  async prepare({ signal }: ProviderPrepareContextInterface): Promise<void> {
    if (!this.cart.getSnapshot().loaded) await this.cart.loadCart(signal);
  }

  activate({ signal }: ProviderActivateContextInterface) {
    if (typeof window === 'undefined') return;

    let sessionUuid = this.sessions.getCurrent()?.sessionUuid;
    let requests = new AbortController();
    let loading = Promise.resolve();
    let unsubscribeHub: (() => Promise<void>) | undefined;
    const subscribe = () => {
      if (!sessionUuid) return;

      const requestSignal = AbortSignal.any([signal, requests.signal]);

      unsubscribeHub = this.hub.subscribe(async (cart) => {
        await loading;
        if (requestSignal.aborted) return;

        const current = this.state.getSnapshot().cart;

        if (!current || current.shop.uuid !== cart.shop.uuid) return;

        this.state.load(cart);
      });
    };

    subscribe();
    const unsubscribeSession = this.sessions.subscribe((session) => {
      if (session?.sessionUuid === sessionUuid) return;

      sessionUuid = session?.sessionUuid;
      requests.abort();
      requests = new AbortController();
      this.cart.clearCart();
      void unsubscribeHub?.();
      unsubscribeHub = undefined;
      loading = sessionUuid
        ? this.cart.loadCart(AbortSignal.any([signal, requests.signal])).catch(() => undefined)
        : Promise.resolve();
      subscribe();
    });

    return async () => {
      unsubscribeSession();
      requests.abort();
      await unsubscribeHub?.();
    };
  }

  dispose(): void {
    this.cart.dispose();
  }
}

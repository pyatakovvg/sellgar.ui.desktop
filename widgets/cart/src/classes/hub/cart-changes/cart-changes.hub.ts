import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

import { Inject, Injectable } from '@sellgar/app';

import { CartEntity, ConfigInterface } from '@library/domain';
import { SessionContextInterface } from '@library/session';
import { type SocketIOConnectionInterface, SocketIOConnectionsInterface } from '@library/socket-io';

import { CartChangesHubInterface } from './cart-changes-hub.interface';

@Injectable()
export class CartChangesHub implements CartChangesHubInterface {
  private readonly connection: SocketIOConnectionInterface;

  constructor(
    @Inject(ConfigInterface) private readonly config: ConfigInterface,
    @Inject(SessionContextInterface) sessions: SessionContextInterface,
    @Inject(SocketIOConnectionsInterface) connections: SocketIOConnectionsInterface,
  ) {
    this.connection = connections.get(config.getSocketGatewayUrl(), {
      addTrailingSlash: false,
      auth: (callback) => {
        void sessions
          .issueSocketTicket()
          .then(({ ticket }) => callback({ ticket }))
          .catch(() => callback({}));
      },
      forceNew: true,
      path: '/socket.io/carts',
      transports: ['websocket'],
      withCredentials: true,
    });
  }

  subscribe(changed: (cart: CartEntity) => void | Promise<void>): () => Promise<void> {
    const subscriptions = ['cart.created', 'cart.updated', 'cart.closed', 'cart.projection.updated'].map((eventType) =>
      this.connection.subscribeDelivery(eventType, async (value, delivery) => {
        if (delivery.channel !== 'carts') throw new Error('Invalid Cart channel');

        // Retained v1 notifications predate snapshots; initial loading already covers them.
        if (delivery.schemaVersion === 1) return;

        if (delivery.schemaVersion !== 2) throw new Error('Unsupported Cart snapshot schema');

        const cart = plainToInstance(CartEntity, value, { excludeExtraneousValues: true });

        await validateOrReject(cart);

        for (const item of cart.items) {
          item.imageUrl = item.imageUuid
            ? new URL(`/v1/files/${item.imageUuid}`, this.config.getGatewayUrl()).toString()
            : null;
        }

        await changed(cart);
      }),
    );

    return async () => {
      await Promise.all(subscriptions.map((subscription) => subscription.dispose()));
    };
  }
}

import { BindingModuleInterface, type BindingRegistryInterface } from '@sellgar/app';

import { SocketIOBindings } from '@library/socket-io';

import { CartApplicationState } from './cart.state';
import { CartWidgetServiceInterface } from './cart-service.interface';
import { CartChangesHub } from './classes/hub/cart-changes/cart-changes.hub';
import { CartChangesHubInterface } from './classes/hub/cart-changes/cart-changes-hub.interface';
import { CartWidgetService } from './classes/service/cart/cart.service';
import { CartStore } from './classes/store/cart/cart.store';

export class CartBindings implements BindingModuleInterface {
  register(registry: BindingRegistryInterface): void {
    new SocketIOBindings().register(registry);
    registry.bind(CartApplicationState).toSelf().inSingletonScope();
    registry.bind(CartStore).toSelf().inSingletonScope();
    registry.bind(CartChangesHubInterface).to(CartChangesHub).inSingletonScope();
    registry.bind(CartWidgetService).toSelf().inSingletonScope();
    registry.bind(CartWidgetServiceInterface).toService(CartWidgetService);
  }
}

import {
  Inject,
  Provider,
  ProviderInterface,
  type ProviderPrepareContextInterface,
  WidgetPreloaderInterface,
} from '@sellgar/app';

import { CartWidget } from './cart.widget';

@Provider()
export class CartApplicationProvider extends ProviderInterface {
  constructor(@Inject(WidgetPreloaderInterface) private readonly widgets: WidgetPreloaderInterface) {
    super();
  }

  prepare(context: ProviderPrepareContextInterface) {
    return this.widgets.preload(context, CartWidget);
  }

  dispose(): void {}
}

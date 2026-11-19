import { Widget, WidgetDefinition } from '@sellgar/app/next';

import { CartProvider } from './providers/cart/cart.provider';
import { WidgetView } from './view/widget.view';

@Widget({ view: WidgetView, providers: [CartProvider] })
export class CartWidget extends WidgetDefinition {}

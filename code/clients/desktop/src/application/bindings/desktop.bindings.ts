import { BindingModuleInterface, type BindingRegistryInterface } from '@sellgar/app';
import type { ApplicationFactoryContext } from '@sellgar/app/next';

import { DomainBinding } from '@library/domain';
import { SessionContextInterface } from '@library/session';

import { readStorefrontConfig } from '../config/storefront-config';
import { StorefrontConfigState } from '../config/storefront-config.state';
import { BrowserDeviceService } from '../device/browser-device.service';
import { SessionService } from '../session/session.service';
import { SessionState } from '../session/session.state';

export class DesktopBindings implements BindingModuleInterface {
  constructor(private readonly context?: ApplicationFactoryContext) {}

  register(registry: BindingRegistryInterface): void {
    const config = this.context?.snapshot
      ? StorefrontConfigState.deserialize(this.context.snapshot[StorefrontConfigState.key])
      : readStorefrontConfig();
    const publicUrl = config.clientGatewayUrl;
    const url = typeof window === 'undefined' ? (process.env.CLIENT_GATEWAY_URL ?? publicUrl) : publicUrl;

    const headers = this.context?.request?.headers;
    const device = new BrowserDeviceService(headers?.['x-device-id']);
    const sessionHeaders: Readonly<Record<string, string>> = headers
      ? { cookie: headers.cookie ?? '', 'user-agent': headers['user-agent'] ?? '' }
      : {};

    new DomainBinding(url, device, config.socketGatewayUrl, sessionHeaders, publicUrl).register(registry);
    const sessions = new SessionService(publicUrl, device);

    if (headers?.['x-sellgar-session']) sessions.hydrate(JSON.parse(headers['x-sellgar-session']));

    registry.bind(StorefrontConfigState).toConstantValue(new StorefrontConfigState(config));
    registry.bind(SessionState).toSelf().inSingletonScope();
    registry.bind(SessionService).toConstantValue(sessions);
    registry.bind(SessionContextInterface).toConstantValue(sessions);
  }
}

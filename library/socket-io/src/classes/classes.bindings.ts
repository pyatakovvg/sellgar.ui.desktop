import { BindingModuleInterface, type BindingRegistryInterface } from '@sellgar/app';

import { SocketIOConnectionsInterface } from './service/socket-io-connections/socket-io-connections.interface.ts';
import { SocketIOConnections } from './service/socket-io-connections/socket-io-connections.service.ts';

export class SocketIOBindings implements BindingModuleInterface {
  register(registry: BindingRegistryInterface): void {
    registry.bind(SocketIOConnectionsInterface).to(SocketIOConnections).inSingletonScope();
  }
}

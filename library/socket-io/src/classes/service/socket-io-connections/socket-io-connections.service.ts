import { Injectable } from '@sellgar/app';

import { SocketIOConnection } from '../../connection/socket-io/socket-io.connection.ts';

import {
  SocketIOConnectionsInterface,
  type SocketIOConnectionInterface,
  type SocketIOConnectionOptions,
} from './socket-io-connections.interface.ts';

@Injectable()
export class SocketIOConnections implements SocketIOConnectionsInterface {
  private readonly connections = new Map<string, SocketIOConnectionInterface>();

  get(url: string, options?: SocketIOConnectionOptions): SocketIOConnectionInterface {
    const key = this.connectionKey(url, options);
    const connection = this.connections.get(key);

    if (connection) {
      return connection;
    }

    const createdConnection = new SocketIOConnection(url, options);

    this.connections.set(key, createdConnection);

    return createdConnection;
  }

  private connectionKey(url: string, options?: SocketIOConnectionOptions): string {
    return `${url}\u0000${options?.path ?? '/socket.io'}`;
  }
}

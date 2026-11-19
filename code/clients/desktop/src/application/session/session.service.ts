import type { DeviceServiceInterface } from '@library/domain';
import { resolveGatewayUrl } from '@library/domain/gateway-url';
import { SessionContextInterface, type VisitorSession } from '@library/session';

import { parseVisitorSession } from './parse-visitor-session';

export type { VisitorSession } from '@library/session';

class SessionRequestError extends Error {
  constructor(readonly status: number) {
    super(`Session request failed (${status})`);
  }
}

export class SessionService implements SessionContextInterface {
  private current: VisitorSession | undefined;

  private readonly listeners = new Set<(session: VisitorSession | undefined) => void>();

  private lastActivityAt = 0;

  private channel?: BroadcastChannel;

  constructor(
    private readonly gatewayUrl: string,
    private readonly device: DeviceServiceInterface,
  ) {}

  hydrate(input: unknown): void {
    this.accept(input);
    this.lastActivityAt = Date.now();
  }

  getCurrent(): VisitorSession | undefined {
    return this.current;
  }

  subscribe(listener: (session: VisitorSession | undefined) => void): () => void {
    this.listeners.add(listener);

    return () => this.listeners.delete(listener);
  }

  async issueSocketTicket(signal?: AbortSignal): Promise<{ ticket: string; expiresAt: string }> {
    const response = await this.request('socket-ticket', 'POST', undefined, signal);

    if (
      typeof response !== 'object' ||
      response === null ||
      !('ticket' in response) ||
      !('expiresAt' in response) ||
      typeof response.ticket !== 'string' ||
      response.ticket.length === 0 ||
      typeof response.expiresAt !== 'string' ||
      !Number.isFinite(Date.parse(response.expiresAt))
    ) {
      throw new Error('Invalid socket ticket response');
    }

    return { ticket: response.ticket, expiresAt: response.expiresAt };
  }

  async start(signal: AbortSignal): Promise<() => void> {
    if (!this.current) await this.initialize(signal);

    this.channel = new BroadcastChannel('sellgar.session');
    this.channel.onmessage = () => {
      void this.synchronize(signal).catch(() =>
        console.error('Не удалось проверить сессию после изменения в другой вкладке'),
      );
    };

    const activity = () => {
      if (document.visibilityState !== 'visible' || Date.now() - this.lastActivityAt < 60_000) return;

      this.lastActivityAt = Date.now();
      void this.initialize(signal).catch(() => console.error('Не удалось продлить сессию посетителя'));
    };

    document.addEventListener('pointerdown', activity, { passive: true });
    document.addEventListener('keydown', activity);
    document.addEventListener('visibilitychange', activity);

    return () => {
      document.removeEventListener('pointerdown', activity);
      document.removeEventListener('keydown', activity);
      document.removeEventListener('visibilitychange', activity);
      this.channel?.close();
      this.channel = undefined;
      this.listeners.clear();
    };
  }

  initialize(signal?: AbortSignal): Promise<VisitorSession> {
    return this.exclusive(async () => {
      const previous = this.current?.sessionUuid;
      const session = this.accept(await this.request('session', 'POST', undefined, signal));

      this.lastActivityAt = Date.now();
      if (previous && previous !== session.sessionUuid) this.channel?.postMessage('changed');

      return session;
    }, signal);
  }

  login(input: { login: string; password: string }, signal?: AbortSignal): Promise<VisitorSession> {
    return this.exclusive(async () => {
      const session = this.accept(await this.request('login', 'POST', input, signal));

      this.channel?.postMessage('changed');

      return session;
    }, signal);
  }

  logout(signal?: AbortSignal): Promise<VisitorSession> {
    return this.exclusive(async () => {
      await this.request('logout', 'POST', undefined, signal);
      this.update(undefined);
      try {
        return this.accept(await this.request('session', 'POST', undefined, signal));
      } finally {
        this.channel?.postMessage('changed');
      }
    }, signal);
  }

  private synchronize(signal: AbortSignal): Promise<VisitorSession | undefined> {
    return this.exclusive(async () => {
      try {
        return this.accept(await this.request('session', 'GET', undefined, signal));
      } catch (error) {
        if (!(error instanceof SessionRequestError) || error.status !== 401) throw error;

        this.update(undefined);

        return undefined;
      }
    }, signal);
  }

  private exclusive<T>(operation: () => Promise<T>, signal?: AbortSignal): Promise<T> {
    return navigator.locks.request('sellgar.session', { signal }, operation);
  }

  private async request(path: string, method: 'GET' | 'POST', body?: unknown, signal?: AbortSignal): Promise<unknown> {
    const response = await fetch(resolveGatewayUrl(`/v1/auth/${path}`, this.gatewayUrl), {
      method,
      credentials: 'include',
      cache: 'no-store',
      headers: { 'x-device-id': this.device.getUniqueId(), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });

    if (!response.ok) throw new SessionRequestError(response.status);

    return response.json();
  }

  private update(session: VisitorSession | undefined): void {
    this.current = session;
    for (const listener of this.listeners) {
      try {
        listener(session);
      } catch {
        console.error('Не удалось обновить потребителя сессии');
      }
    }
  }

  private accept(input: unknown): VisitorSession {
    const current = parseVisitorSession(input);

    this.update(current);

    return current;
  }
}

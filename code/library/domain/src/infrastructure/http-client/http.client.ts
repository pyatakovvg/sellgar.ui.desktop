import { HttpException, Inject, Injectable, NetworkError, NotFoundException } from '@sellgar/app';

import { DeviceServiceInterface } from '../device/device-service.interface.ts';
import { HttpClientInterface } from './http-client.interface.ts';
import type { HttpRequestInput } from './http-request.input.ts';
import { HttpSessionContextInterface } from './http-session-context.interface';

@Injectable()
export class HttpClient implements HttpClientInterface {
  constructor(
    @Inject(DeviceServiceInterface) private readonly device: DeviceServiceInterface,
    @Inject(HttpSessionContextInterface)
    private readonly sessionContext: HttpSessionContextInterface = { getHeaders: () => ({}) },
  ) {}

  get(url: URL, signal?: AbortSignal): Promise<unknown> {
    return this.request(url, { method: 'GET', signal });
  }

  async request(url: URL, input: HttpRequestInput): Promise<unknown> {
    const { signal } = input;
    const request = { method: input.method, url: url.toString() };
    let response: Response;

    try {
      response = await fetch(url, {
        method: input.method,
        cache: 'no-store',
        signal,
        credentials: input.withSession ? 'include' : 'omit',
        headers: {
          ...(input.withSession
            ? { ...this.sessionContext.getHeaders(), 'x-device-id': this.device.getUniqueId() }
            : {}),
          ...(input.body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: input.body ? JSON.stringify(input.body) : undefined,
      });
    } catch (error) {
      if (signal?.aborted) throw error;

      throw new NetworkError('Backend response is unavailable.', { cause: error, request });
    }
    if (!response.ok) {
      const payload = await response.text();

      if (response.status === 404) throw new NotFoundException(payload, { request });

      throw new HttpException(payload, response.status, { request });
    }

    return response.json();
  }
}

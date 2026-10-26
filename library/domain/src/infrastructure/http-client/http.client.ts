import { HttpException, Injectable, NetworkError, NotFoundException } from '@sellgar/app';
import { HttpClientInterface } from './http-client.interface.ts';
@Injectable()
export class HttpClient implements HttpClientInterface {
  async get(url: URL, signal?: AbortSignal): Promise<unknown> {
    const request = { method: 'GET', url: url.toString() };
    let response: Response;
    try {
      response = await fetch(url, { cache: 'no-store', signal });
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

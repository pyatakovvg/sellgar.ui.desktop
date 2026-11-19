import type { HttpRequestInput } from './http-request.input.ts';

export abstract class HttpClientInterface {
  abstract request(url: URL, input: HttpRequestInput): Promise<unknown>;

  abstract get(url: URL, signal?: AbortSignal): Promise<unknown>;
}

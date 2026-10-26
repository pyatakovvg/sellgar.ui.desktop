export abstract class HttpClientInterface {
  abstract get(url: URL, signal?: AbortSignal): Promise<unknown>;
}

/** Request-scoped server headers; credentials are never serialized into presentation state. */
export abstract class HttpSessionContextInterface {
  abstract getHeaders(): Readonly<Record<string, string>>;
}

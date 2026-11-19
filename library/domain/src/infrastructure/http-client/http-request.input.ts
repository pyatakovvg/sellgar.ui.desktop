export interface HttpRequestInput {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: object;
  signal?: AbortSignal;
  withSession?: boolean;
}

import { ApplicationStateInterface } from '@sellgar/app/next';

import { parseStorefrontConfig, type StorefrontConfig } from './storefront-config';

export class StorefrontConfigState extends ApplicationStateInterface<StorefrontConfig> {
  static readonly key = 'storefrontConfig';

  static deserialize = parseStorefrontConfig;

  constructor(private config: StorefrontConfig) {
    super();
  }

  getSnapshot = () => this.config;

  subscribe = () => () => {};

  hydrate(snapshot: StorefrontConfig): void {
    this.config = snapshot;
  }

  serialize(): StorefrontConfig {
    return this.config;
  }
}

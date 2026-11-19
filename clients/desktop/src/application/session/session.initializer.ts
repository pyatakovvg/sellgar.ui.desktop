import {
  type ApplicationInitializerContextInterface,
  ApplicationInitializerInterface,
  Initializer,
} from '@sellgar/app';

import { SessionService } from './session.service';

@Initializer()
export class SessionInitializer extends ApplicationInitializerInterface {
  constructor(private readonly sessions: SessionService) {
    super();
  }

  async execute(context: ApplicationInitializerContextInterface): Promise<void> {
    if (typeof window === 'undefined') {
      if (!this.sessions.getCurrent()) throw new Error('Storefront session was not prepared before rendering.');

      return;
    }

    context.disposables.add(await this.sessions.start(context.signal));
  }
}

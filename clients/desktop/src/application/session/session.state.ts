import { Inject, Injectable } from '@sellgar/app';
import { ApplicationStateInterface } from '@sellgar/app/next';

import type { VisitorSession } from '@library/session';

import { parseVisitorSession } from './parse-visitor-session';
import { SessionService } from './session.service';

@Injectable()
export class SessionState extends ApplicationStateInterface<VisitorSession> {
  static readonly key = 'session';

  static deserialize(input: unknown): VisitorSession {
    return parseVisitorSession(input);
  }

  constructor(@Inject(SessionService) private readonly sessions: SessionService) {
    super();
  }

  getSnapshot = () => {
    const session = this.sessions.getCurrent();

    if (!session) throw new Error('Session is not prepared.');

    return session;
  };

  subscribe = (listener: () => void) => this.sessions.subscribe(listener);

  hydrate(snapshot: VisitorSession): void {
    this.sessions.hydrate(snapshot);
  }

  serialize(): unknown {
    return this.getSnapshot();
  }
}

import type { VisitorSession } from '@library/session';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseVisitorSession(input: unknown): VisitorSession {
  const session = input as Partial<VisitorSession> | null;

  if (
    !session ||
    typeof session.sessionUuid !== 'string' ||
    !UUID_PATTERN.test(session.sessionUuid) ||
    !(session.userUuid === null || (typeof session.userUuid === 'string' && UUID_PATTERN.test(session.userUuid))) ||
    typeof session.expiresAt !== 'string' ||
    !Number.isFinite(Date.parse(session.expiresAt))
  ) {
    throw new Error('Invalid session response');
  }

  const current = { sessionUuid: session.sessionUuid, userUuid: session.userUuid, expiresAt: session.expiresAt };

  return current;
}

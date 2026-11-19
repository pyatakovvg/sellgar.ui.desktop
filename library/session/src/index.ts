export interface VisitorSession {
  sessionUuid: string;
  userUuid: string | null;
  expiresAt: string;
}

export abstract class SessionContextInterface {
  abstract getCurrent(): VisitorSession | undefined;

  abstract subscribe(listener: (session: VisitorSession | undefined) => void): () => void;

  abstract issueSocketTicket(signal?: AbortSignal): Promise<{ ticket: string; expiresAt: string }>;
}

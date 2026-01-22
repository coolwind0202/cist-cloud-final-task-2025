import type { SessionId, Username } from "./types.js";

interface BaseSessionManager {
  createSession(username: Username): SessionId;
  validateSession(sessionId: SessionId): boolean;
  destroySession(sessionId: SessionId): void;
  getSessionUsername(sessionId: SessionId): Username | undefined;
}

export class MemorySessionManager implements BaseSessionManager {
  sessions: Map<SessionId, Username>;

  constructor() {
    this.sessions = new Map();
  }

  createSession(username: Username): SessionId {
    const sessionId = (Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)) as SessionId;
    this.sessions.set(sessionId, username);
    return sessionId;
  }

  validateSession(sessionId: SessionId): boolean {
    return this.sessions.has(sessionId);
  }

  destroySession(sessionId: SessionId): void {
    this.sessions.delete(sessionId);
  }

  getSessionUsername(sessionId: SessionId): Username | undefined {
    return this.sessions.get(sessionId);
  }
}

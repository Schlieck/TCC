import type { UserId } from '../../domain/user/user.js';

export interface SessionClaims {
  userId: UserId;
  tokenVersion: number;
}

export interface TokenService {
  issue(claims: SessionClaims): Promise<string>;
  /** Devolve `null` para token inválido, adulterado ou expirado. */
  verify(token: string): Promise<SessionClaims | null>;
}

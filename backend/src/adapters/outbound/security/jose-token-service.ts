import { errors, jwtVerify, SignJWT } from 'jose';
import type { SessionClaims, TokenService } from '../../../application/ports/token-service.js';

const ALGORITHM = 'HS256';

export class JoseTokenService implements TokenService {
  private readonly key: Uint8Array;

  constructor(
    secret: string,
    private readonly expiresIn: string,
  ) {
    this.key = new TextEncoder().encode(secret);
  }

  issue({ userId, tokenVersion }: SessionClaims): Promise<string> {
    return new SignJWT({ ver: tokenVersion })
      .setProtectedHeader({ alg: ALGORITHM })
      .setSubject(String(userId))
      .setIssuedAt()
      .setExpirationTime(this.expiresIn)
      .sign(this.key);
  }

  async verify(token: string): Promise<SessionClaims | null> {
    try {
      const { payload } = await jwtVerify(token, this.key, { algorithms: [ALGORITHM] });
      const userId = Number(payload.sub);
      const tokenVersion = payload.ver;
      if (!Number.isInteger(userId) || typeof tokenVersion !== 'number') {
        return null;
      }
      return { userId, tokenVersion };
    } catch (error) {
      if (error instanceof errors.JOSEError) {
        return null;
      }
      throw error;
    }
  }
}

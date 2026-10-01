import type { Clock } from '../../src/application/ports/clock.js';
import type { PasswordHasher } from '../../src/application/ports/password-hasher.js';
import type { SessionClaims, TokenService } from '../../src/application/ports/token-service.js';
import { parseCalendarDate, type CalendarDate } from '../../src/domain/shared/calendar-date.js';

export class FakePasswordHasher implements PasswordHasher {
  hash(plain: string): Promise<string> {
    return Promise.resolve(`hashed:${plain}`);
  }

  verify(plain: string, hash: string | null): Promise<boolean> {
    return Promise.resolve(hash === `hashed:${plain}`);
  }
}

export class FakeTokenService implements TokenService {
  issue({ userId, tokenVersion }: SessionClaims): Promise<string> {
    return Promise.resolve(`token:${userId}:${tokenVersion}`);
  }

  verify(token: string): Promise<SessionClaims | null> {
    const match = /^token:(\d+):(\d+)$/.exec(token);
    return Promise.resolve(
      match ? { userId: Number(match[1]), tokenVersion: Number(match[2]) } : null,
    );
  }
}

export class FixedClock implements Clock {
  constructor(private current = new Date('2026-10-01T12:00:00Z')) {}

  now(): Date {
    return this.current;
  }

  today(): CalendarDate {
    return parseCalendarDate(this.current.toISOString().slice(0, 10));
  }

  advanceMinutes(minutes: number): void {
    this.current = new Date(this.current.getTime() + minutes * 60_000);
  }
}

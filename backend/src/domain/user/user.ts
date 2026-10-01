import type { CalendarDate } from '../shared/calendar-date.js';
import { NotFoundError, ValidationError } from '../shared/errors.js';
import type { Email } from './email.js';
import type { Phone } from './phone.js';

export type UserId = number;

export interface User {
  readonly id: UserId;
  readonly name: string;
  readonly email: Email;
  readonly phone: Phone;
  readonly birthDate: CalendarDate;
  readonly passwordHash: string;
  readonly tokenVersion: number;
  readonly privacyConsentAt: Date;
}

export type NewUser = Omit<User, 'id' | 'tokenVersion'>;

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 100;
const OLDEST_BIRTH_DATE = '1900-01-01';

export function parsePersonName(raw: string): string {
  const name = raw.trim().replace(/\s+/g, ' ');
  if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) {
    throw new ValidationError('INVALID_NAME', 'Name must have 2 to 100 characters', 'name');
  }
  return name;
}

export function assertValidBirthDate(birthDate: CalendarDate, today: CalendarDate): void {
  if (birthDate >= today || birthDate < OLDEST_BIRTH_DATE) {
    throw new ValidationError('INVALID_BIRTH_DATE', 'Birth date must be in the past', 'birthDate');
  }
}

export function userNotFound(): NotFoundError {
  return new NotFoundError('USER_NOT_FOUND', 'User not found');
}

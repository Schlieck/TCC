import { parseCalendarDate, type CalendarDate } from '../../../domain/shared/calendar-date.js';
import { ConflictError } from '../../../domain/shared/errors.js';
import { parseEmail } from '../../../domain/user/email.js';
import { parsePhone } from '../../../domain/user/phone.js';
import {
  assertValidBirthDate,
  parsePersonName,
  userNotFound,
  type UserId,
} from '../../../domain/user/user.js';
import type { Clock } from '../../ports/clock.js';
import type { ProfileChanges, UserRepository } from '../../ports/user-repository.js';
import { toUserProfile, type UserProfile } from './user-profile.js';

export interface UpdateProfileInput {
  userId: UserId;
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
}

export class UpdateProfile {
  constructor(
    private readonly users: UserRepository,
    private readonly clock: Clock,
  ) {}

  async execute({ userId, ...raw }: UpdateProfileInput): Promise<UserProfile> {
    const changes = this.parseChanges(raw);
    if (changes.email) {
      const owner = await this.users.findByEmail(changes.email);
      if (owner && owner.id !== userId) {
        throw new ConflictError('EMAIL_ALREADY_IN_USE', 'E-mail already registered');
      }
    }

    const updated = await this.users.updateProfile(userId, changes);
    if (!updated) {
      throw userNotFound();
    }
    return toUserProfile(updated);
  }

  private parseChanges(raw: Omit<UpdateProfileInput, 'userId'>): ProfileChanges {
    return {
      ...(raw.name === undefined ? {} : { name: parsePersonName(raw.name) }),
      ...(raw.email === undefined ? {} : { email: parseEmail(raw.email) }),
      ...(raw.phone === undefined ? {} : { phone: parsePhone(raw.phone) }),
      ...(raw.birthDate === undefined ? {} : { birthDate: this.parseBirthDate(raw.birthDate) }),
    };
  }

  private parseBirthDate(raw: string): CalendarDate {
    const birthDate = parseCalendarDate(raw, 'birthDate');
    assertValidBirthDate(birthDate, this.clock.today());
    return birthDate;
  }
}

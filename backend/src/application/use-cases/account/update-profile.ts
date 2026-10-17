import { parseCalendarDate, type CalendarDate } from '../../../domain/shared/calendar-date.js';
import { ConflictError, ValidationError } from '../../../domain/shared/errors.js';
import { parseEmail } from '../../../domain/user/email.js';
import { parsePhone } from '../../../domain/user/phone.js';
import {
  assertValidBirthDate,
  parsePersonName,
  userNotFound,
  type User,
  type UserId,
} from '../../../domain/user/user.js';
import type { Clock } from '../../ports/clock.js';
import type { PasswordHasher } from '../../ports/password-hasher.js';
import type { ProfileChanges, UserRepository } from '../../ports/user-repository.js';
import { toUserProfile, type UserProfile } from './user-profile.js';

export interface UpdateProfileInput {
  userId: UserId;
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  /** Obrigatória só para trocar o e-mail, que é o que dá acesso à recuperação de senha. */
  currentPassword?: string;
}

export class UpdateProfile {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly clock: Clock,
  ) {}

  async execute({ userId, currentPassword, ...raw }: UpdateProfileInput): Promise<UserProfile> {
    const changes = this.parseChanges(raw);
    const user = await this.users.findById(userId);
    if (!user) {
      throw userNotFound();
    }

    if (changes.email && changes.email !== user.email) {
      await this.assertCurrentPassword(user, currentPassword);
      const owner = await this.users.findByEmail(changes.email);
      if (owner) {
        throw new ConflictError('EMAIL_ALREADY_IN_USE', 'E-mail already registered');
      }
    }

    const updated = await this.users.updateProfile(userId, changes);
    if (!updated) {
      throw userNotFound();
    }
    return toUserProfile(updated);
  }

  private async assertCurrentPassword(user: User, currentPassword?: string): Promise<void> {
    if (!currentPassword) {
      throw new ValidationError(
        'CURRENT_PASSWORD_REQUIRED',
        'The current password is required to change the e-mail',
        'currentPassword',
      );
    }
    if (!(await this.hasher.verify(currentPassword, user.passwordHash))) {
      throw new ValidationError(
        'WRONG_CURRENT_PASSWORD',
        'Current password does not match',
        'currentPassword',
      );
    }
  }

  private parseChanges(
    raw: Omit<UpdateProfileInput, 'userId' | 'currentPassword'>,
  ): ProfileChanges {
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

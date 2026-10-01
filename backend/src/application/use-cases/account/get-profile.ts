import { NotFoundError } from '../../../domain/shared/errors.js';
import type { UserId } from '../../../domain/user/user.js';
import type { UserRepository } from '../../ports/user-repository.js';
import { toUserProfile, type UserProfile } from './user-profile.js';

export class GetProfile {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: UserId): Promise<UserProfile> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundError('USER_NOT_FOUND', 'User not found');
    }
    return toUserProfile(user);
  }
}

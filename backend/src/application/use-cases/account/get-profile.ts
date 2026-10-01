import { userNotFound, type UserId } from '../../../domain/user/user.js';
import type { UserRepository } from '../../ports/user-repository.js';
import { toUserProfile, type UserProfile } from './user-profile.js';

export class GetProfile {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: UserId): Promise<UserProfile> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw userNotFound();
    }
    return toUserProfile(user);
  }
}

import type { User } from '../../../domain/user/user.js';
import type { TokenService } from '../../ports/token-service.js';
import { toUserProfile, type UserProfile } from '../account/user-profile.js';

export interface AuthSession {
  token: string;
  user: UserProfile;
}

export async function startSession(user: User, tokens: TokenService): Promise<AuthSession> {
  const token = await tokens.issue({ userId: user.id, tokenVersion: user.tokenVersion });
  return { token, user: toUserProfile(user) };
}

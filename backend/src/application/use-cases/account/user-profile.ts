import type { User, UserId } from '../../../domain/user/user.js';

export interface UserProfile {
  id: UserId;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
}

export function toUserProfile(user: User): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    birthDate: user.birthDate,
  };
}

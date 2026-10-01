import bcrypt from 'bcrypt';
import type { PasswordHasher } from '../../../application/ports/password-hasher.js';

export class BcryptPasswordHasher implements PasswordHasher {
  private dummyHash: Promise<string> | undefined;

  constructor(private readonly cost: number) {}

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.cost);
  }

  async verify(plain: string, hash: string | null): Promise<boolean> {
    if (hash === null) {
      await bcrypt.compare(plain, await this.getDummyHash());
      return false;
    }
    return bcrypt.compare(plain, hash);
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= bcrypt.hash('shifty-dummy-password', this.cost);
    return this.dummyHash;
  }
}

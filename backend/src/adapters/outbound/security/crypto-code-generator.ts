import { randomInt } from 'node:crypto';
import type { CodeGenerator } from '../../../application/ports/code-generator.js';

const CODE_DIGITS = 6;

export class CryptoCodeGenerator implements CodeGenerator {
  generate(): string {
    return String(randomInt(0, 10 ** CODE_DIGITS)).padStart(CODE_DIGITS, '0');
  }
}

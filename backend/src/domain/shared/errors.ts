export type DomainErrorCode =
  | 'INVALID_NAME'
  | 'INVALID_EMAIL'
  | 'INVALID_PHONE'
  | 'INVALID_DATE'
  | 'INVALID_BIRTH_DATE'
  | 'WEAK_PASSWORD'
  | 'PRIVACY_CONSENT_REQUIRED'
  | 'EMAIL_ALREADY_IN_USE'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_TOKEN'
  | 'USER_NOT_FOUND';

export type DomainErrorKind = 'validation' | 'unauthenticated' | 'not_found' | 'conflict';

export abstract class DomainError extends Error {
  abstract readonly kind: DomainErrorKind;

  constructor(
    readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends DomainError {
  readonly kind = 'validation';

  constructor(
    code: DomainErrorCode,
    message: string,
    readonly field?: string,
  ) {
    super(code, message);
  }
}

export class AuthenticationError extends DomainError {
  readonly kind = 'unauthenticated';
}

export class NotFoundError extends DomainError {
  readonly kind = 'not_found';
}

export class ConflictError extends DomainError {
  readonly kind = 'conflict';
}

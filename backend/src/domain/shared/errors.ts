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
  | 'USER_NOT_FOUND'
  | 'INVALID_GROUP_NAME'
  | 'GROUP_NAME_TAKEN'
  | 'GROUP_NOT_EMPTY'
  | 'COPING_CARD_GROUP_NOT_FOUND'
  | 'INVALID_CARD_NAME'
  | 'INVALID_CARD_DESCRIPTION'
  | 'INVALID_CARD_GROUP'
  | 'COPING_CARD_NOT_FOUND'
  | 'INVALID_TIME'
  | 'INVALID_PERIOD'
  | 'INVALID_RECORD_TITLE'
  | 'INVALID_RECORD_DESCRIPTION'
  | 'FUTURE_RECORD_DATE'
  | 'EMOTIONS_REQUIRED'
  | 'DUPLICATED_EMOTION'
  | 'INVALID_INTENSITY'
  | 'UNKNOWN_EMOTION'
  | 'THOUGHT_RECORD_NOT_FOUND'
  | 'PERIOD_TOO_LONG'
  | 'INVALID_REPORT_NAME'
  | 'SAVED_REPORT_NOT_FOUND'
  | 'WRONG_CURRENT_PASSWORD'
  | 'CURRENT_PASSWORD_REQUIRED'
  | 'INVALID_VERIFICATION_CODE'
  | 'TOO_MANY_CODE_ATTEMPTS';

export type DomainErrorKind =
  'validation' | 'unauthenticated' | 'not_found' | 'conflict' | 'too_many_attempts';

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

export class TooManyAttemptsError extends DomainError {
  readonly kind = 'too_many_attempts';
}

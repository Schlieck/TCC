export interface HttpErrorDetail {
  field: string;
  message: string;
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: HttpErrorDetail[],
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

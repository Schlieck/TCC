export interface ApiErrorDetail {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details: ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor() {
    super(
      'Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.',
    );
    this.name = 'NetworkError';
  }
}

export class UnexpectedResponseError extends Error {
  constructor() {
    super('O servidor respondeu em um formato inesperado.');
    this.name = 'UnexpectedResponseError';
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Algo deu errado. Tente novamente.';
}

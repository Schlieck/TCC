/** Erro já pronto para o paciente; `field` liga a mensagem a um campo do formulário. */
export class AppError extends Error {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  return 'Algo deu errado. Tente novamente.';
}

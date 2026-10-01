export interface CodeGenerator {
  /** Código numérico de 6 dígitos, gerado com fonte criptograficamente segura. */
  generate(): string;
}

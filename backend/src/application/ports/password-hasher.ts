/** Hash lento (bcrypt) para segredos: senhas e códigos de verificação. */
export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  /**
   * Com `hash` nulo (usuário inexistente) devolve `false` gastando o mesmo tempo,
   * para não revelar pelo tempo de resposta quais e-mails estão cadastrados.
   */
  verify(plain: string, hash: string | null): Promise<boolean>;
}

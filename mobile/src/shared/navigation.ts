/** Valor novo a cada navegação, para a tela reaplicar os parâmetros mesmo se forem iguais. */
export function navigationStamp(): string {
  return String(Date.now());
}

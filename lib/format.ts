/**
 * Formatação de dinheiro em pt-BR. Estava repetida em treze pontos do projeto,
 * cada um remontando `toFixed(2).replace(".", ",")` na mão — o tipo de coisa
 * que diverge em silêncio quando alguém esquece um dos lugares.
 */

/** `12.5` → `"12,50"` (sem o prefixo). */
export function formatAmount(value: number) {
  return value.toFixed(2).replace(".", ",");
}

/** `12.5` → `"R$ 12,50"`. */
export function formatBRL(value: number) {
  return "R$ " + formatAmount(value);
}

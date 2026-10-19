/** Nome da emoção escrito ao lado do último ponto da linha, em pixels da área do gráfico. */
export interface DirectLabel {
  id: number;
  x: number;
  y: number;
  text: string;
}

export const LABEL_FONT_SIZE = 10;
export const LABEL_SHIFT_X = -12;
const LINE_HEIGHT = 14;
const CHAR_WIDTH = 6;
const GAP_ABOVE = 8;
const GAP_BELOW = LINE_HEIGHT + 6;

interface Box {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * Deslocamento vertical de cada rótulo para que nenhum cubra outro: tenta logo acima do
 * ponto, depois abaixo, e vai se afastando alternadamente.
 */
export function placeDirectLabels(labels: DirectLabel[]): Map<number, number> {
  const candidates = Array.from({ length: labels.length * 2 }, (_, attempt) => {
    const distance = Math.floor(attempt / 2) * LINE_HEIGHT;
    return attempt % 2 === 0 ? -GAP_ABOVE - distance : GAP_BELOW + distance;
  });
  const placed: Box[] = [];
  const shifts = new Map<number, number>();

  for (const label of [...labels].sort((a, b) => a.y - b.y)) {
    const shift =
      candidates.find(
        (candidate) => !placed.some((box) => overlaps(box, boxOf(label, candidate))),
      ) ?? -GAP_ABOVE;
    placed.push(boxOf(label, shift));
    shifts.set(label.id, shift);
  }
  return shifts;
}

function boxOf(label: DirectLabel, shift: number): Box {
  const left = label.x + LABEL_SHIFT_X;
  const baseline = label.y + shift;
  return {
    left,
    right: left + label.text.length * CHAR_WIDTH,
    top: baseline - LINE_HEIGHT,
    bottom: baseline,
  };
}

function overlaps(a: Box, b: Box): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
}

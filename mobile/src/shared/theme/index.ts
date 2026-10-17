export const colors = {
  background: '#333333',
  surface: '#3D3D3D',
  border: '#555555',
  primary: '#FDE38A',
  primaryPressed: '#F2D46B',
  onPrimary: '#2B2B2B',
  placeholder: '#8A7D55',
  text: '#F5F5F5',
  textMuted: '#BDBDBD',
  activeTab: '#8AB4F8',
  danger: '#D93636',
  dangerText: '#FF8A80',
  dangerOnPrimary: '#A11A12',
  onDanger: '#FFFFFF',
  success: '#8FD694',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.6)',
} as const;

export const fonts = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
} as const;

export const fontSize = {
  caption: 12,
  body: 15,
  subtitle: 18,
  title: 24,
  display: 40,
} as const;

/**
 * Uma cor fixa por emoção (slug da API): a cor acompanha a emoção, nunca a posição na lista.
 * Paleta categórica de referência (variante escura), validada para daltonismo e contraste
 * >= 3:1 sobre `chart.surface`. A ordem abaixo é a ordem validada dos tons e a da legenda.
 */
export const EMOTION_ORDER = [
  'sadness',
  'anxiety',
  'relief',
  'joy',
  'shame',
  'guilt',
  'fear',
  'anger',
] as const;

export const emotionColors: Record<string, string> = {
  sadness: '#3987e5',
  anxiety: '#d95926',
  relief: '#199e70',
  joy: '#c98500',
  shame: '#d55181',
  guilt: '#008300',
  fear: '#9085e9',
  anger: '#e66767',
};

export const fallbackEmotionColor = '#898781';

export function emotionColor(slug: string | undefined): string {
  return (slug === undefined ? undefined : emotionColors[slug]) ?? fallbackEmotionColor;
}

export function emotionRank(slug: string): number {
  const index = EMOTION_ORDER.findIndex((candidate) => candidate === slug);
  return index === -1 ? EMOTION_ORDER.length : index;
}

/** Superfície e traços do gráfico: grade e eixos discretos, texto em tons neutros. */
export const chart = {
  surface: '#262626',
  grid: '#3a3a38',
  axis: '#5c5b57',
  text: '#c3c2b7',
  /** Séries fora de destaque quando a pessoa destaca uma emoção na legenda. */
  dimmed: '#4a4945',
} as const;

/** Mesmos tons, na variante para fundo claro: usada no PDF impresso/compartilhado. */
export const emotionPrintColors: Record<string, string> = {
  sadness: '#2a78d6',
  anxiety: '#eb6834',
  relief: '#1baf7a',
  joy: '#eda100',
  shame: '#e87ba4',
  guilt: '#008300',
  fear: '#4a3aa7',
  anger: '#e34948',
};

/** Tinta e traços do PDF (papel branco). */
export const print = {
  ink: '#0b0b0b',
  secondaryInk: '#52514e',
  grid: '#e1e0d9',
  axis: '#c3c2b7',
  surface: '#ffffff',
} as const;

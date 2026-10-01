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

/** Uma cor fixa por emoção (slug da API), usada nos selos e nas linhas do gráfico. */
export const emotionColors: Record<string, string> = {
  anxiety: '#F39C12',
  sadness: '#5DADE2',
  anger: '#E74C3C',
  fear: '#AF7AC5',
  guilt: '#95A5A6',
  shame: '#F1948A',
  joy: '#F7DC6F',
  relief: '#58D68D',
};

export const fallbackEmotionColor = '#D5D8DC';

export function emotionColor(slug: string | undefined): string {
  return (slug === undefined ? undefined : emotionColors[slug]) ?? fallbackEmotionColor;
}

export type EmotionId = number;

/** Emoção da lista pré-definida; `name` é o rótulo exibido (pt-BR). */
export interface Emotion {
  readonly id: EmotionId;
  readonly slug: string;
  readonly name: string;
}

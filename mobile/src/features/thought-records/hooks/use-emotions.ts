import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { listEmotions, type Emotion } from '../api';

/** A lista de emoções é fixa no servidor; buscamos uma vez por sessão. */
export function useEmotions() {
  return useQuery({ queryKey: ['emotions'], queryFn: listEmotions, staleTime: Infinity });
}

export function useEmotionsById(): Map<number, Emotion> {
  const emotions = useEmotions();
  return useMemo(
    () => new Map(emotions.data?.map((emotion) => [emotion.id, emotion])),
    [emotions.data],
  );
}

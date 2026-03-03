import type { WordPair } from '../types/word';

/**
 * Выбирает индекс карточки с весами: чем ниже score, тем чаще показывается.
 * @param words массив пар
 * @returns индекс 0..words.length-1
 */
export function pickWeightedIndex(words: WordPair[]): number {
  if (!words.length) return 0;

  const weights = words.map(w => {
    const score = typeof w.score === 'number' ? w.score : 0;
    return Math.pow(101 - score, 2);
  });

  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;

  for (let i = 0; i < words.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }

  return 0;
}

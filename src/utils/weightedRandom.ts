import type { WordPair } from '../types/word';

/**
 * Выбирает индекс карточки с весами: чем ниже score, тем чаще показывается.
 * @param words массив пар
 * @param excludeIndex индекс, который не выбирать (например, текущая карточка)
 * @returns индекс 0..words.length-1
 */
export function pickWeightedIndex(
  words: WordPair[],
  excludeIndex?: number
): number {
  if (!words.length) return 0;

  const weights = words.map((w, i) => {
    if (i === excludeIndex) return 0;
    const score = typeof w.score === 'number' ? w.score : 0;
    return Math.pow(101 - score, 2);
  });

  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return excludeIndex === 0 && words.length > 1 ? 1 : 0;

  let r = Math.random() * total;
  for (let i = 0; i < words.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }

  return 0;
}

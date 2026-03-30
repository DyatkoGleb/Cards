import { pickWeightedIndex } from '../src/utils/weightedRandom';
import { clampScore } from '../src/utils/wordRules';

const words = [
  { id: '1', word: 'a', translation: 'a', createdAt: 1, score: 0 },
  { id: '2', word: 'b', translation: 'b', createdAt: 1, score: 100 },
];

describe('weighted random helpers', () => {
  test('clamps score to 0..100', () => {
    expect(clampScore(-10)).toBe(0);
    expect(clampScore(50)).toBe(50);
    expect(clampScore(999)).toBe(100);
  });

  test('returns valid index', () => {
    const index = pickWeightedIndex(words);
    expect(index === 0 || index === 1).toBe(true);
  });

  test('respects exclude index when possible', () => {
    const index = pickWeightedIndex(words, 0);
    expect(index).toBe(1);
  });
});

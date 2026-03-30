import { clampScore } from '../src/utils/wordRules';

describe('CardsScreen scoring and reveal', () => {
  test('applies score clamp for known/unknown updates', () => {
    expect(clampScore(10 + 1)).toBe(11);
    expect(clampScore(0 - 3)).toBe(0);
    expect(clampScore(100 + 1)).toBe(100);
  });
});

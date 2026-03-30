import { SCORE_MAX, SCORE_MIN } from '../config/featureFlags';

export function clampScore(score: number): number {
  return Math.min(SCORE_MAX, Math.max(SCORE_MIN, score));
}

export function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

export function makeWordPairKey(word: string, translation: string): string {
  return `${normalizeText(word)}::${normalizeText(translation)}`;
}

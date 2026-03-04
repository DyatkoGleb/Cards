/**
 * Проверка предложения: при наличии GEMINI_API_KEY — через Gemini,
 * иначе через LanguageTool.
 */

import { GEMINI_API_KEY } from '../config/api';

const LT_URL = 'https://api.languagetool.org/v2/check';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

export type CheckResult =
  | { ok: true }
  | { ok: false; suggestion: string }
  | { error: string };

type LTMatch = {
  offset: number;
  length: number;
  replacements?: Array<{ value: string }>;
};

export async function checkSentence(
  word: string,
  sentence: string
): Promise<CheckResult> {
  const text = sentence.trim();
  if (!text) {
    return { error: 'Enter the sentence' };
  }

  if (GEMINI_API_KEY.trim()) {
    const geminiResult = await checkWithGemini(word, text);
    if ('error' in geminiResult && (geminiResult.error.includes('quota') || geminiResult.error.includes('billing') || geminiResult.error.includes('exceeded'))) {
      return checkWithLanguageTool(text);
    }
    return geminiResult;
  }
  return checkWithLanguageTool(text);
}

async function checkWithGemini(word: string, text: string): Promise<CheckResult> {
  const prompt = `You are a strict English grammar checker. The learner used the word "${word}" in this sentence: "${text}"

Reply with exactly one line:
- The word "OK" (uppercase) only if the sentence is grammatically correct and natural (check subject-verb agreement, tenses, articles, etc.).
- Otherwise write only the corrected English sentence, nothing else. No explanations.`;

  try {
    const res = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 120,
          temperature: 0.1,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      if (res.status === 403 || res.status === 400) {
        return { error: 'Неверный или неактивный API ключ Gemini' };
      }
      return { error: err || `Ошибка ${res.status}` };
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().replace(/^["']|["']$/g, '') ?? '';

    if (/^\s*OK\s*$/i.test(raw)) {
      return { ok: true };
    }
    if (raw.length > 0) {
      return { ok: false, suggestion: raw };
    }
    return { error: 'Пустой ответ' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: msg.includes('Network') || msg.includes('fetch') ? 'Нет сети' : msg };
  }
}

async function checkWithLanguageTool(text: string): Promise<CheckResult> {
  try {
    const body = `text=${encodeURIComponent(text)}&language=en-US`;
    const res = await fetch(LT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body,
    });

    if (!res.ok) {
      return { error: res.status === 429 ? 'Слишком много запросов, подождите минуту' : `Ошибка ${res.status}` };
    }

    const data = (await res.json()) as { matches?: LTMatch[] };
    const matches = data.matches ?? [];

    if (matches.length === 0) {
      return { ok: true };
    }

    const suggestion = buildCorrectedText(text, matches);
    return { ok: false, suggestion };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: msg.includes('Network') || msg.includes('fetch') ? 'Нет сети' : msg };
  }
}

function buildCorrectedText(original: string, matches: LTMatch[]): string {
  const sorted = [...matches]
    .filter(m => m.replacements && m.replacements.length > 0)
    .sort((a, b) => b.offset - a.offset);

  let result = original;
  for (const m of sorted) {
    const replacement = m.replacements![0].value;
    result = result.slice(0, m.offset) + replacement + result.slice(m.offset + m.length);
  }
  return result;
}

/**
 * Проверка предложения: при наличии ключа Gemini (из профиля) — через Gemini,
 * иначе через LanguageTool.
 */

import { getGeminiApiKey } from '../config/api';

const LT_URL = 'https://api.languagetool.org/v2/check';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

export type CheckResult =
  | { status: 'ok'; message: 'ok' }
  | { status: 'corrected'; message: string }
  | { status: 'error'; message: string };

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
    return { status: 'error', message: 'Enter the sentence' };
  }

  if (getGeminiApiKey()) {
    const geminiResult = await checkWithGemini(word, text);
    if (
      geminiResult.status === 'error' &&
      !geminiResult.message.includes('Неверный или неактивный API ключ Gemini')
    ) {
      const fallback = await checkWithLanguageTool(text);
      return fallback;
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
    const res = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(getGeminiApiKey())}`, {
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
        return { status: 'error', message: 'Неверный или неактивный API ключ Gemini' };
      }
      return { status: 'error', message: err || `Ошибка ${res.status}` };
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().replace(/^["']|["']$/g, '') ?? '';

    if (/^\s*OK\s*$/i.test(raw)) {
      return { status: 'ok', message: 'ok' };
    }
    if (raw.length > 0) {
      const suggestionTrimmed = raw.trim();
      const textTrimmed = text.trim();
      // Игнорировать исправление «только добавить точку в конец»
      if (suggestionTrimmed === textTrimmed + '.') {
        return { status: 'ok', message: 'ok' };
      }
      return { status: 'corrected', message: raw };
    }
    return { status: 'error', message: 'Пустой ответ' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      status: 'error',
      message: msg.includes('Network') || msg.includes('fetch') ? 'Нет сети' : msg,
    };
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
      return {
        status: 'error',
        message:
          res.status === 429
            ? 'Слишком много запросов, подождите минуту'
            : `Ошибка ${res.status}`,
      };
    }

    const data = (await res.json()) as { matches?: LTMatch[] };
    const matches = data.matches ?? [];

    if (matches.length === 0) {
      return { status: 'ok', message: 'ok' };
    }

    const suggestion = buildCorrectedText(text, matches);
    return { status: 'corrected', message: suggestion };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      status: 'error',
      message: msg.includes('Network') || msg.includes('fetch') ? 'Нет сети' : msg,
    };
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

export type TranscriptionResult =
  | { status: 'ok'; transcription: string }
  | { status: 'not_found' }
  | { status: 'error'; message: string };

const DICTIONARY_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const REQUEST_TIMEOUT_MS = 7000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), timeoutMs);
    promise
      .then(value => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(error => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

function extractPhonetic(payload: unknown): string | null {
  if (!Array.isArray(payload)) return null;
  for (const entry of payload) {
    if (!entry || typeof entry !== 'object') continue;
    const direct = (entry as { phonetic?: unknown }).phonetic;
    if (typeof direct === 'string' && direct.trim()) return direct.trim();
    const phonetics = (entry as { phonetics?: unknown }).phonetics;
    if (!Array.isArray(phonetics)) continue;
    for (const item of phonetics) {
      if (!item || typeof item !== 'object') continue;
      const text = (item as { text?: unknown }).text;
      if (typeof text === 'string' && text.trim()) return text.trim();
    }
  }
  return null;
}

export async function fetchWordTranscription(word: string): Promise<TranscriptionResult> {
  const normalized = word.trim().toLowerCase();
  if (!normalized) return { status: 'not_found' };
  try {
    const response = await withTimeout(
      fetch(`${DICTIONARY_URL}/${encodeURIComponent(normalized)}`),
      REQUEST_TIMEOUT_MS
    );
    if (response.status === 404) return { status: 'not_found' };
    if (!response.ok) return { status: 'error', message: `HTTP ${response.status}` };
    const payload = (await response.json()) as unknown;
    const transcription = extractPhonetic(payload);
    if (!transcription) return { status: 'not_found' };
    return { status: 'ok', transcription };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { status: 'error', message };
  }
}

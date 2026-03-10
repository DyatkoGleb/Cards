/** Ключ Gemini, введённый в профиле (AsyncStorage) */
let userGeminiKey = '';

export function getGeminiApiKey(): string {
  return (userGeminiKey ?? '').trim();
}

export function setGeminiKey(key: string): void {
  userGeminiKey = key ?? '';
}

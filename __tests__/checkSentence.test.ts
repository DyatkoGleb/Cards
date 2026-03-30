import { checkSentence } from '../src/services/checkSentence';
import { setGeminiKey } from '../src/config/api';

describe('checkSentence', () => {
  afterEach(() => {
    setGeminiKey('');
    jest.restoreAllMocks();
  });

  test('returns normalized ok status for Gemini OK', async () => {
    setGeminiKey('key');
    jest.spyOn(global, 'fetch' as never).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'OK' }] } }],
      }),
    } as never);

    const result = await checkSentence('word', 'Sentence');
    expect(result).toEqual({ status: 'ok', message: 'ok' });
  });

  test('falls back to LanguageTool on Gemini quota error', async () => {
    setGeminiKey('key');
    jest
      .spyOn(global, 'fetch' as never)
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'quota exceeded',
      } as never)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ matches: [] }),
      } as never);

    const result = await checkSentence('word', 'Sentence');
    expect(result).toEqual({ status: 'ok', message: 'ok' });
  });

  test('includes studied word in Gemini prompt (same contract as profile/cards sentence modal)', async () => {
    setGeminiKey('key');
    const fetchMock = jest.spyOn(global, 'fetch' as never).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'OK' }] } }],
      }),
    } as never);

    await checkSentence('uniqueWord', 'This uses uniqueWord.');

    expect(fetchMock).toHaveBeenCalled();
    const opts = fetchMock.mock.calls[0][1] as { body: string };
    const body = JSON.parse(opts.body) as {
      contents: Array<{ parts: Array<{ text: string }> }>;
    };
    const prompt = body.contents[0].parts[0].text;
    expect(prompt).toContain('uniqueWord');
  });
});

import { fetchWordTranscription } from '../src/services/transcriptionService';

describe('fetchWordTranscription', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns not_found for empty word', async () => {
    const result = await fetchWordTranscription('   ');
    expect(result).toEqual({ status: 'not_found' });
  });

  test('returns ok with phonetic from API payload', async () => {
    jest.spyOn(global, 'fetch' as never).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [
        {
          phonetic: '/həˈloʊ/',
        },
      ],
    } as never);

    const result = await fetchWordTranscription('hello');
    expect(result).toEqual({ status: 'ok', transcription: '/həˈloʊ/' });
  });

  test('returns not_found on HTTP 404', async () => {
    jest.spyOn(global, 'fetch' as never).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as never);

    const result = await fetchWordTranscription('xyzunknown');
    expect(result).toEqual({ status: 'not_found' });
  });

  test('returns error on non-ok HTTP status', async () => {
    jest.spyOn(global, 'fetch' as never).mockResolvedValueOnce({
      ok: false,
      status: 503,
    } as never);

    const result = await fetchWordTranscription('word');
    expect(result).toEqual({ status: 'error', message: 'HTTP 503' });
  });

  test('returns not_found when payload has no phonetic', async () => {
    jest.spyOn(global, 'fetch' as never).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [{}],
    } as never);

    const result = await fetchWordTranscription('word');
    expect(result).toEqual({ status: 'not_found' });
  });

  test('maps timeout rejection to error status', async () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'fetch' as never).mockImplementation(
      () =>
        new Promise(() => {
          /* never resolves */
        })
    );

    const p = fetchWordTranscription('slow');
    await jest.advanceTimersByTimeAsync(8000);
    const result = await p;
    jest.useRealTimers();

    expect(result).toEqual({ status: 'error', message: 'timeout' });
  });

  test('maps network failure to error status', async () => {
    jest.spyOn(global, 'fetch' as never).mockRejectedValueOnce(new Error('Network down'));

    const result = await fetchWordTranscription('word');
    expect(result).toEqual({ status: 'error', message: 'Network down' });
  });
});

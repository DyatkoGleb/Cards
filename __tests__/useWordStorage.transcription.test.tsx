import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWordStorage } from '../src/hooks/useWordStorage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('useWordStorage transcription fields', () => {
  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockReset();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  test('hydrates transcription and status from storage', async () => {
    const getItem = AsyncStorage.getItem as jest.Mock;
    getItem.mockImplementation(async (key: string) => {
      if (key === 'words') {
        return JSON.stringify([
          {
            id: '1',
            word: 'test',
            translation: 'тест',
            createdAt: Date.now(),
            score: 0,
            showInGeneralSet: true,
            folderIds: [],
            transcription: '/test/',
            transcriptionStatus: 'ready',
          },
        ]);
      }
      return null;
    });

    let snapshot: ReturnType<typeof useWordStorage> | null = null;
    function Probe() {
      snapshot = useWordStorage();
      return null;
    }

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<Probe />);
    });

    expect(snapshot?.words[0].transcription).toBe('/test/');
    expect(snapshot?.words[0].transcriptionStatus).toBe('ready');
  });

  test('addWord leaves transcriptionStatus idle for new words (job skipped in test env)', async () => {
    let snapshot: ReturnType<typeof useWordStorage> | null = null;
    function Probe() {
      snapshot = useWordStorage();
      return null;
    }

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<Probe />);
    });

    await ReactTestRenderer.act(async () => {
      await snapshot?.addWord('new', 'новый');
    });

    const w = snapshot?.words.find(x => x.word === 'new');
    expect(w?.transcriptionStatus).toBe('idle');
  });

  test('retryTranscription resolves when word id is missing', async () => {
    const getItem = AsyncStorage.getItem as jest.Mock;
    getItem.mockResolvedValue(null);

    let snapshot: ReturnType<typeof useWordStorage> | null = null;
    function Probe() {
      snapshot = useWordStorage();
      return null;
    }

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<Probe />);
    });

    await ReactTestRenderer.act(async () => {
      await snapshot?.retryTranscription('missing-id');
    });

    expect(snapshot?.words).toEqual([]);
  });
});

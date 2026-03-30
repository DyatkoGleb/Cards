import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWordStorage } from '../src/hooks/useWordStorage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('useWordStorage folders and dedupe', () => {
  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockReset();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  test('deduplicates by word+translation and merges folder membership', async () => {
    let snapshot: ReturnType<typeof useWordStorage> | null = null;
    function Probe() {
      snapshot = useWordStorage();
      return null;
    }

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<Probe />);
    });

    await ReactTestRenderer.act(async () => {
      await snapshot?.addWord('Hello', 'Привет', { folderIds: ['f1'] });
      await snapshot?.addWord(' hello ', ' привет ', { folderIds: ['f2'] });
    });

    expect(snapshot?.words.length).toBe(1);
    expect(snapshot?.words[0].folderIds).toContain('f2');
  });

  test('editWord applies folderIds and showInGeneralSet', async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation(async (key: string) => {
      if (key === 'words') {
        return JSON.stringify([
          {
            id: 'w1',
            word: 'cat',
            translation: 'кот',
            createdAt: Date.now(),
            score: 10,
            showInGeneralSet: true,
            folderIds: ['f1'],
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

    await ReactTestRenderer.act(async () => {
      await snapshot?.editWord('w1', 'cat', 'кот', 10, {
        folderIds: ['f2'],
        showInGeneralSet: false,
      });
    });

    expect(snapshot?.words[0].folderIds).toEqual(['f2']);
    expect(snapshot?.words[0].showInGeneralSet).toBe(false);
  });
});

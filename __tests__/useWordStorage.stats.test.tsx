import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { useWordStorage } from '../src/hooks/useWordStorage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key: string) => {
    if (key === 'words') {
      const now = Date.now();
      return Promise.resolve(
        JSON.stringify([
          { id: '1', word: 'a', translation: 'a', createdAt: now, score: 0 },
          { id: '2', word: 'b', translation: 'b', createdAt: now - 9 * 86400000, score: 0 },
        ])
      );
    }
    return Promise.resolve(null);
  }),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('useWordStorage stats', () => {
  test('computes weekWords from createdAt', async () => {
    let snapshot: ReturnType<typeof useWordStorage> | null = null;
    function Probe() {
      snapshot = useWordStorage();
      return null;
    }

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<Probe />);
    });

    expect(snapshot?.stats.totalWords).toBe(2);
    expect(snapshot?.stats.weekWords).toBe(1);
  });
});

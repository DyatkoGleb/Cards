import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWordStorage } from '../src/hooks/useWordStorage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('useWordStorage recovery', () => {
  test('recovers from malformed storage payloads', async () => {
    const getItem = AsyncStorage.getItem as jest.Mock;
    getItem.mockImplementation(async (key: string) => {
      if (key === 'words') return '{broken';
      if (key === 'stats') return '{broken';
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

    expect(snapshot).not.toBeNull();
    expect(snapshot?.loading).toBe(false);
    expect(snapshot?.words).toEqual([]);
    expect(snapshot?.stats.totalWords).toBe(0);
  });
});

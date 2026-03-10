import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GEMINI_API_KEY_STORAGE } from '../utils/storageKeys';
import { setGeminiKey } from '../config/api';

export function useGeminiKey(): [
  string,
  (value: string) => void,
  (value: string) => Promise<void>,
  boolean,
] {
  const [key, setKey] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(GEMINI_API_KEY_STORAGE);
        if (saved != null) {
          setKey(saved);
          setGeminiKey(saved);
        }
        setLoaded(true);
      } catch {
        setLoaded(true);
      }
    })();
  }, []);

  const saveKey = useCallback(async (value: string) => {
    const trimmed = value.trim();
    setKey(trimmed);
    setGeminiKey(trimmed);
    if (trimmed) {
      await AsyncStorage.setItem(GEMINI_API_KEY_STORAGE, trimmed);
    } else {
      await AsyncStorage.removeItem(GEMINI_API_KEY_STORAGE);
    }
  }, []);

  return [key, setKey, saveKey, loaded];
}

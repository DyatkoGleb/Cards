import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME_STORAGE_KEY } from '../utils/storageKeys';

/**
 * Восстанавливает сохранённую тему из AsyncStorage при монтировании.
 * @param isDark текущее состояние темы
 * @param toggleTheme переключение темы
 */
export function useThemePersistence(
  isDark: boolean,
  toggleTheme: () => void
): void {
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' && !isDark) toggleTheme();
      if (saved === 'light' && isDark) toggleTheme();
    })();
  }, []);
}

/**
 * Сохраняет выбор темы в AsyncStorage.
 */
export async function persistTheme(dark: boolean): Promise<void> {
  await AsyncStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
}

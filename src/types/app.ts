import type { Stats, WordPair } from './word';
import type { Palette } from './palette';

/**
 * Пропсы корневого навигатора и табов (слова, статистика, тема, колбэки).
 */
export type AppNavigatorProps = {
  /** Список пар слово–перевод */
  words: WordPair[];
  /** Статистика (словарь, серия) */
  stats: Stats;
  /** Текущая палитра (светлая/тёмная) */
  palette: Palette;
  /** Тема тёмная или светлая */
  isDark: boolean;
  /** Переключение темы светлая/тёмная */
  toggleTheme: () => void;
  /** cb добавления нового слова */
  addWord: (word: string, translation: string) => Promise<WordPair | void>;
  /** cb удаления слова по id */
  deleteWord: (id: string) => Promise<void>;
  /** cb редактирования слова (id, слово, перевод; оценка опционально, иначе сохраняется текущая) */
  editWord: (
    id: string,
    word: string,
    translation: string,
    score?: number
  ) => Promise<void>;
  /** cb обновления серии посещений при открытии экрана карточек */
  updateStreak: () => Promise<void>;
};

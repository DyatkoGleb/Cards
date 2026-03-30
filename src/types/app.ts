import type { Stats, WordPair, Folder, TrainingSetSelection } from './word';
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
  addWord: (
    word: string,
    translation: string,
    options?: { folderIds?: string[]; showInGeneralSet?: boolean }
  ) => Promise<WordPair | void>;
  /** cb удаления слова по id */
  deleteWord: (id: string) => Promise<void>;
  /** cb редактирования слова (id, слово, перевод; оценка опционально, иначе сохраняется текущая) */
  editWord: (
    id: string,
    word: string,
    translation: string,
    score?: number,
    options?: { folderIds?: string[]; showInGeneralSet?: boolean }
  ) => Promise<void>;
  /** Список папок */
  folders: Folder[];
  /** Создание новой папки */
  addFolder: (name: string) => Promise<Folder | null>;
  /** Текущий активный набор карточек */
  selectedSet: TrainingSetSelection;
  /** Переключение набора карточек */
  setSelectedSet: (next: TrainingSetSelection) => Promise<void>;
  /** cb обновления серии посещений при открытии экрана карточек */
  updateStreak: () => Promise<void>;
  /** Повторный фоновый запрос транскрипции */
  retryTranscription: (id: string) => Promise<void>;
};

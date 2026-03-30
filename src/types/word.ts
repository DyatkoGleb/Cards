/**
 * Пара слово–перевод с метаданными и оценкой.
 */
export type WordPair = {
  /** Уникальный id записи */
  id: string;
  /** Слово на английском */
  word: string;
  /** Перевод */
  translation: string;
  /** Время создания (timestamp) */
  createdAt: number;
  /** Оценка знания 0..100 */
  score: number;
  /** Признак включения в общий набор */
  showInGeneralSet?: boolean;
  /** Связанные папки */
  folderIds?: string[];
  /** Фоновой статус получения транскрипции */
  transcriptionStatus?: 'idle' | 'pending' | 'ready' | 'failed';
  /** Транскрипция слова (IPA) */
  transcription?: string;
};

export type Folder = {
  id: string;
  name: string;
  createdAt: number;
};

export type TrainingMode = 'general' | 'folder';

export type TrainingSetSelection = {
  mode: TrainingMode;
  folderId: string | null;
};

/**
 * Статистика пользователя (словарь, серия).
 */
export type Stats = {
  /** Всего слов в словаре */
  totalWords: number;
  /** Слова добавленные за неделю */
  weekWords: number;
  /** Текущая серия дней посещений */
  streak: number;
  /** Дата последнего визита YYYY-MM-DD */
  lastVisitDate: string;
};

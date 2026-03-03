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

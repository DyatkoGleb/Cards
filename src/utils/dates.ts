/** Возвращает сегодняшнюю дату в формате YYYY-MM-DD */
export function getTodayString(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

/** Проверяет, что переданная дата (YYYY-MM-DD) — вчера */
export function isYesterday(date: string): boolean {
  const d = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return d.toISOString().slice(0, 10) ===
    yesterday.toISOString().slice(0, 10);
}
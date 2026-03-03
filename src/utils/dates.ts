export function getTodayString() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function isYesterday(date: string) {
  const d = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return d.toISOString().slice(0, 10) ===
    yesterday.toISOString().slice(0, 10);
}
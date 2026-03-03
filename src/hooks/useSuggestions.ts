import { useMemo } from 'react';

export function useSuggestions(
  source: string[],
  value: string,
  limit = 5
) {
  return useMemo(() => {
    if (!value.trim()) return [];
    const lower = value.toLowerCase();
    return source
      .filter(v => v.toLowerCase().includes(lower))
      .slice(0, limit);
  }, [source, value, limit]);
}
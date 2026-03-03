import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WordPair, Stats } from '../types/word';
import { getTodayString, isYesterday } from '../utils/dates';

const WORDS_KEY = 'words';
const STATS_KEY = 'stats';

export function useWordStorage() {
  const [words, setWords] = useState<WordPair[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalWords: 0,
    weekWords: 0,
    streak: 0,
    lastVisitDate: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedWords = await AsyncStorage.getItem(WORDS_KEY);
      const storedStats = await AsyncStorage.getItem(STATS_KEY);

      const parsedWords: WordPair[] = storedWords
        ? JSON.parse(storedWords)
        : [];

      setWords(parsedWords);

      if (storedStats) {
        setStats(JSON.parse(storedStats));
      } else {
        setStats({
          totalWords: parsedWords.length,
          weekWords: 0,
          streak: 0,
          lastVisitDate: '',
        });
      }

      setLoading(false);
    })();
  }, []);

  const persistWords = async (next: WordPair[]) => {
    setWords(next);
    await AsyncStorage.setItem(WORDS_KEY, JSON.stringify(next));
  };

  const persistStats = async (next: Stats) => {
    setStats(next);
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(next));
  };

  const addWord = useCallback(async (word: string, translation: string) => {
    const newWord: WordPair = {
      id: Date.now().toString(),
      word,
      translation,
      createdAt: Date.now(),
      score: 0,
    };

    const updated = [...words, newWord];
    await persistWords(updated);

    const weekAgo = Date.now() - 7 * 86400000;
    await persistStats({
      ...stats,
      totalWords: updated.length,
      weekWords: updated.filter(w => w.createdAt >= weekAgo).length,
    });

    return newWord;
  }, [words, stats]);

  const deleteWord = async (id: string) => {
    const updated = words.filter(w => w.id !== id);
    await persistWords(updated);
    await persistStats({ ...stats, totalWords: updated.length });
  };

  const editWord = async (
    id: string,
    word: string,
    translation: string,
    score: number
  ) => {
    const updated = words.map(w =>
      w.id === id
        ? { ...w, word, translation, score }
        : w
    );
  
    await persistWords(updated);
  };

  const updateStreak = async () => {
    const today = getTodayString();
  
    if (stats.lastVisitDate === today) {
      return;
    }
  
    let nextStreak = 1;
  
    if (stats.lastVisitDate && isYesterday(stats.lastVisitDate)) {
      nextStreak = stats.streak + 1;
    }
  
    const nextStats = {
      ...stats,
      streak: nextStreak,
      lastVisitDate: today,
    };
  
    setStats(nextStats);
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(nextStats));
  };

  const replaceAll = async (
    nextWords: WordPair[],
    nextStats: Stats
  ) => {
    setWords(nextWords);
    setStats(nextStats);
  
    await AsyncStorage.setItem(
      WORDS_KEY,
      JSON.stringify(nextWords)
    );
    await AsyncStorage.setItem(
      STATS_KEY,
      JSON.stringify(nextStats)
    );
  };

  return {
    words,
    stats,
    loading,
    addWord,
    deleteWord,
    editWord,
    updateStreak,
    replaceAll,
  };
}
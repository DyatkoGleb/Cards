import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WordPair, Stats, Folder, TrainingSetSelection } from '../types/word';
import { getTodayString, isYesterday } from '../utils/dates';
import {
  FOLDERS_STORAGE_KEY,
  STATS_STORAGE_KEY,
  TRAINING_SET_STORAGE_KEY,
  WORDS_STORAGE_KEY,
} from '../utils/storageKeys';
import {
  TRAINING_MODE_GENERAL,
  TRAINING_MODE_FOLDER,
} from '../config/featureFlags';
import { clampScore, makeWordPairKey, normalizeText } from '../utils/wordRules';
import { fetchWordTranscription } from '../services/transcriptionService';

const DEFAULT_STATS: Stats = {
  totalWords: 0,
  weekWords: 0,
  streak: 0,
  lastVisitDate: '',
};

const DEFAULT_SET: TrainingSetSelection = {
  mode: TRAINING_MODE_GENERAL,
  folderId: null,
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function useWordStorage() {
  const [words, setWords] = useState<WordPair[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedSet, setSelectedSetState] = useState<TrainingSetSelection>(DEFAULT_SET);
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedWords = await AsyncStorage.getItem(WORDS_STORAGE_KEY);
      const storedStats = await AsyncStorage.getItem(STATS_STORAGE_KEY);
      const storedFolders = await AsyncStorage.getItem(FOLDERS_STORAGE_KEY);
      const storedSet = await AsyncStorage.getItem(TRAINING_SET_STORAGE_KEY);

      const parsedWords = safeParse<WordPair[]>(storedWords, []).map(w => ({
        ...w,
        score: clampScore(typeof w.score === 'number' ? w.score : 0),
        showInGeneralSet: w.showInGeneralSet ?? true,
        folderIds: Array.isArray(w.folderIds) ? w.folderIds : [],
        transcription: typeof w.transcription === 'string' ? w.transcription : undefined,
        transcriptionStatus:
          w.transcriptionStatus === 'pending' ||
          w.transcriptionStatus === 'ready' ||
          w.transcriptionStatus === 'failed'
            ? w.transcriptionStatus
            : w.transcription
              ? 'ready'
              : 'idle',
      }));
      const parsedFolders = safeParse<Folder[]>(storedFolders, []);
      const parsedSet = safeParse<TrainingSetSelection>(storedSet, DEFAULT_SET);

      setWords(parsedWords);
      setFolders(parsedFolders);
      setSelectedSetState(parsedSet);
      const weekAgo = Date.now() - 7 * 86400000;
      const computedStats: Stats = {
        ...DEFAULT_STATS,
        ...safeParse<Stats>(storedStats, DEFAULT_STATS),
        totalWords: parsedWords.length,
        weekWords: parsedWords.filter(w => w.createdAt >= weekAgo).length,
      };
      setStats(computedStats);

      await AsyncStorage.setItem(WORDS_STORAGE_KEY, JSON.stringify(parsedWords));
      await AsyncStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(parsedFolders));
      await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(computedStats));
      await AsyncStorage.setItem(TRAINING_SET_STORAGE_KEY, JSON.stringify(parsedSet));
      setLoading(false);
    })();
  }, []);

  const persistWords = async (next: WordPair[]) => {
    setWords(next);
    await AsyncStorage.setItem(WORDS_STORAGE_KEY, JSON.stringify(next));
  };

  const persistStats = async (next: Stats) => {
    setStats(next);
    await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(next));
  };

  const persistFolders = async (next: Folder[]) => {
    setFolders(next);
    await AsyncStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(next));
  };

  const setSelectedSet = useCallback(async (next: TrainingSetSelection) => {
    const normalized: TrainingSetSelection =
      next.mode === TRAINING_MODE_FOLDER
        ? { mode: TRAINING_MODE_FOLDER, folderId: next.folderId }
        : { mode: TRAINING_MODE_GENERAL, folderId: null };
    setSelectedSetState(normalized);
    await AsyncStorage.setItem(TRAINING_SET_STORAGE_KEY, JSON.stringify(normalized));
  }, []);

  const ensureDefaultFolder = useCallback(async () => {
    if (folders.length > 0) return folders;
    const defaultFolder: Folder = {
      id: 'default',
      name: 'General',
      createdAt: Date.now(),
    };
    const next = [defaultFolder];
    await persistFolders(next);
    return next;
  }, [folders]);

  const upsertStatsByWords = useCallback(async (nextWords: WordPair[]) => {
    const weekAgo = Date.now() - 7 * 86400000;
    await persistStats({
      ...stats,
      totalWords: nextWords.length,
      weekWords: nextWords.filter(w => w.createdAt >= weekAgo).length,
    });
  }, [stats]);

  const mergeWord = (
    source: WordPair,
    patch: {
      word: string;
      translation: string;
      score?: number;
      showInGeneralSet?: boolean;
      folderIds?: string[];
    }
  ): WordPair => ({
    ...source,
    word: patch.word,
    translation: patch.translation,
    score: clampScore(patch.score ?? source.score),
    showInGeneralSet: patch.showInGeneralSet ?? source.showInGeneralSet ?? true,
    folderIds: patch.folderIds ?? source.folderIds ?? [],
  });

  const addFolder = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const existing = folders.find(
      f => normalizeText(f.name) === normalizeText(trimmed)
    );
    if (existing) return existing;
    const folder: Folder = {
      id: Date.now().toString(),
      name: trimmed,
      createdAt: Date.now(),
    };
    await persistFolders([...folders, folder]);
    return folder;
  }, [folders]);

  const deleteFolder = useCallback(async (id: string) => {
    const nextFolders = folders.filter(f => f.id !== id);
    const nextWords = words.map(w => ({
      ...w,
      folderIds: (w.folderIds ?? []).filter(fid => fid !== id),
    }));
    await persistFolders(nextFolders);
    await persistWords(nextWords);
    if (selectedSet.mode === TRAINING_MODE_FOLDER && selectedSet.folderId === id) {
      await setSelectedSet(DEFAULT_SET);
    }
  }, [folders, words, selectedSet, setSelectedSet]);

  const saveWordList = useCallback(async (nextWords: WordPair[]) => {
    await persistWords(nextWords);
    await upsertStatsByWords(nextWords);
  }, [upsertStatsByWords]);

  const runTranscriptionJob = useCallback(async (wordId: string, value: string) => {
    if (process.env.NODE_ENV === 'test') return;
    const latestRaw = await AsyncStorage.getItem(WORDS_STORAGE_KEY);
    const latest = safeParse<WordPair[]>(latestRaw, words);
    const markPending = latest.map(w =>
      w.id === wordId
        ? { ...w, transcriptionStatus: 'pending' as const }
        : w
    );
    await persistWords(markPending);
    const result = await fetchWordTranscription(value);
    const afterFetch = markPending.map(w => {
      if (w.id !== wordId) return w;
      if (result.status === 'ok') {
        return {
          ...w,
          transcription: result.transcription,
          transcriptionStatus: 'ready' as const,
        };
      }
      return {
        ...w,
        transcriptionStatus: result.status === 'not_found' ? 'idle' as const : 'failed' as const,
      };
    });
    await persistWords(afterFetch);
  }, [words]);

  const addWord = useCallback(async (
    word: string,
    translation: string,
    options?: { folderIds?: string[]; showInGeneralSet?: boolean }
  ) => {
    await ensureDefaultFolder();
    const normalizedKey = makeWordPairKey(word, translation);
    const existing = words.find(w => makeWordPairKey(w.word, w.translation) === normalizedKey);
    if (existing) {
      const mergedFolders = Array.from(
        new Set([...(existing.folderIds ?? []), ...(options?.folderIds ?? [])])
      );
      const updatedExisting = mergeWord(existing, {
        word: word.trim(),
        translation: translation.trim(),
        showInGeneralSet: options?.showInGeneralSet ?? existing.showInGeneralSet ?? true,
        folderIds: mergedFolders,
      });
      const nextWords = words.map(w => (w.id === existing.id ? updatedExisting : w));
      await saveWordList(nextWords);
      return updatedExisting;
    }
    const newWord: WordPair = {
      id: Date.now().toString(),
      word: word.trim(),
      translation: translation.trim(),
      createdAt: Date.now(),
      score: 0,
      showInGeneralSet: options?.showInGeneralSet ?? true,
      folderIds: options?.folderIds ?? [],
      transcriptionStatus: 'idle',
    };
    const updated = [...words, newWord];
    await saveWordList(updated);
    runTranscriptionJob(newWord.id, newWord.word).catch(() => {});
    return newWord;
  }, [words, ensureDefaultFolder, saveWordList, runTranscriptionJob]);

  const deleteWord = async (id: string) => {
    const updated = words.filter(w => w.id !== id);
    await saveWordList(updated);
  };

  const editWord = async (
    id: string,
    word: string,
    translation: string,
    score?: number,
    options?: { folderIds?: string[]; showInGeneralSet?: boolean }
  ) => {
    const normalizedKey = makeWordPairKey(word, translation);
    const duplicate = words.find(
      w => w.id !== id && makeWordPairKey(w.word, w.translation) === normalizedKey
    );
    if (duplicate) {
      const merged = {
        ...duplicate,
        score: clampScore(score ?? duplicate.score),
        showInGeneralSet: options?.showInGeneralSet ?? duplicate.showInGeneralSet ?? true,
        folderIds: Array.from(new Set([...(duplicate.folderIds ?? []), ...(options?.folderIds ?? [])])),
      };
      const withoutCurrent = words.filter(w => w.id !== id && w.id !== duplicate.id);
      const updated = [...withoutCurrent, merged];
      await saveWordList(updated);
      return;
    }
    const updated = words.map(w =>
      w.id === id
        ? mergeWord(w, {
            word: word.trim(),
            translation: translation.trim(),
            score: score ?? w.score,
            showInGeneralSet: options?.showInGeneralSet,
            folderIds: options?.folderIds,
          })
        : w
    );
    await saveWordList(updated);
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
    await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(nextStats));
  };

  const retryTranscription = useCallback(async (id: string) => {
    const target = words.find(w => w.id === id);
    if (!target) return;
    await runTranscriptionJob(target.id, target.word);
  }, [words, runTranscriptionJob]);

  return {
    words,
    folders,
    selectedSet,
    stats,
    loading,
    addWord,
    deleteWord,
    editWord,
    addFolder,
    deleteFolder,
    setSelectedSet,
    updateStreak,
    retryTranscription,
  };
}
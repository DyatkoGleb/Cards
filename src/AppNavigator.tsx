import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabs } from './navigation/BottomTabs';
import { Stats, WordPair } from './types/word';

type Props = {
  words: any[];
  stats: any;
  palette: any;
  isDark: boolean;
  toggleTheme: () => void;
  addWord: (word: string, translation: string) => Promise<any>;
  deleteWord: (id: string) => Promise<void>;
  editWord: (id: string, word: string, translation: string) => Promise<void>;
  updateStreak: () => Promise<any>;
  replaceAll: (nextWords: WordPair[], nextStats: Stats) => Promise<void>;
};

export function AppNavigator(props: Props) {
  return (
    <NavigationContainer>
      <BottomTabs {...props} />
    </NavigationContainer>
  );
}
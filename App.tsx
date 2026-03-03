import React, { useState, useMemo } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppNavigator } from './src/AppNavigator';
import { useWordStorage } from './src/hooks/useWordStorage';
import { lightPalette, darkPalette } from './src/theme/palette';

export default function App() {
  const {
    words,
    stats,
    addWord,
    deleteWord,
    editWord,
    updateStreak,
  } = useWordStorage();

  const [isDark, setIsDark] = useState(true);

  const palette = useMemo(
    () => (isDark ? darkPalette : lightPalette),
    [isDark]
  );

  const toggleTheme = () => {
    setIsDark(v => !v);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.page }} edges={['top']}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={palette.page}
        />
        <AppNavigator
          words={words}
          stats={stats}
          addWord={addWord}
          deleteWord={deleteWord}
          editWord={editWord}
          updateStreak={updateStreak}
          palette={palette}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
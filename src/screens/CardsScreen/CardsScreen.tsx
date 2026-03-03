import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { WordPair, Stats } from '../../types/word';
import { styles } from './CardsScreen.styles';

const THEME_KEY = 'theme';

type FakeGradientProps = {
  color: string;
  steps?: number;
};

const FakeGradient = ({
  color,
  steps = 100,
}: FakeGradientProps) => {
  const layers = [];

  for (let i = 0; i < steps; i++) {
    const alpha = (i + 1) / steps;
    layers.push(
      <View
        key={i}
        style={{
          flex: 1,
          backgroundColor: color.replace('ALPHA', alpha.toFixed(2)),
        }}
      />
    );
  }

  return (
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
      }}
    >
      {layers}
    </View>
  );
};

type Props = {
  words: WordPair[];
  updateStreak: () => Promise<Stats>;
  palette: any;
  isDark: boolean;
  toggleTheme: () => void;
  editWord: (
    id: string,
    word: string,
    translation: string,
    score: number
  ) => Promise<void>;
};

export function CardsScreen({
  words,
  updateStreak,
  palette,
  isDark,
  toggleTheme,
  editWord,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);

  const pan = useMemo(() => new Animated.ValueXY(), []);

  useEffect(() => {
    updateStreak();
  }, []);

  useEffect(() => {
    if (!words.length) return;
    pickRandomCard();
  }, [words]);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved === 'dark' && !isDark) toggleTheme();
      if (saved === 'light' && isDark) toggleTheme();
    })();
  }, []);

  function pickWeightedIndex(words: WordPair[]): number {
    const weights = words.map(w => {
      const score = typeof w.score === 'number' ? w.score : 0;
      return Math.pow(101 - score, 2);
    });
  
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
  
    for (let i = 0; i < words.length; i++) {
      r -= weights[i];
      if (r <= 0) return i;
    }
  
    return 0;
  }

  const pickRandomCard = () => {
    if (!words.length) return;
  
    const index = pickWeightedIndex(words);
    setCurrentIndex(index);
    setShowTranslation(Math.random() < 0.5);
  };

  const setTheme = async (dark: boolean) => {
    await AsyncStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    toggleTheme();
  };

  const currentPair = words[currentIndex];

  const updateScore = async (delta: number) => {
    if (!currentPair) return;

    const nextScore = Math.min(
      100,
      Math.max(0, (currentPair.score ?? 0) + delta)
    );

    await editWord(
      currentPair.id,
      currentPair.word,
      currentPair.translation,
      nextScore
    );

    pickRandomCard();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 20,

        onPanResponderMove: Animated.event(
          [null, { dx: pan.x }],
          { useNativeDriver: false }
        ),

        onPanResponderRelease: (_, g) => {
          if (g.dx > 80) {
            updateScore(1);
          } else if (g.dx < -80) {
            updateScore(-3);
          }

          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        },
      }),
    [currentIndex, words]
  );

  return (
    <View
      style={[
        styles.content,
        styles.contentInner,
        { backgroundColor: palette.page },
      ]}
    >
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={[styles.h1, { color: palette.slate900 }]}>
          Cards
        </Text>

        <View style={[styles.toggle, { backgroundColor: palette.border }]}>
          <TouchableOpacity
            style={[
              styles.toggleLight,
              !isDark && { backgroundColor: palette.white },
            ]}
            onPress={() => isDark && setTheme(false)}
          >
            <Text
              style={{
                color: isDark ? palette.slate500 : palette.slate700,
                fontSize: 10,
                fontWeight: '600',
              }}
            >
              Light
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleDark,
              isDark && { backgroundColor: palette.white },
            ]}
            onPress={() => !isDark && setTheme(true)}
          >
            <Text
              style={{
                color: isDark ? palette.slate700 : palette.slate500,
                fontSize: 10,
                fontWeight: '600',
              }}
            >
              Dark
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {!!words.length && (
        <>
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.bigCard,
              {
                backgroundColor: palette.white,
                borderColor: palette.border,
                transform: [{ translateX: pan.x }],
              },
            ]}
          >
            {/* GREEN gradient — swipe right */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.gradientOverlay,
                {
                  opacity: pan.x.interpolate({
                    inputRange: [0, 120],
                    outputRange: [0, 0.25],
                    extrapolate: 'clamp',
                  }),
                },
              ]}
            >
              
              <FakeGradient
              color="rgba(16,185,129,ALPHA)"
            />
            </Animated.View>

            {/* RED gradient — swipe left */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.gradientOverlay,
                {
                  opacity: pan.x.interpolate({
                    inputRange: [-120, 0],
                    outputRange: [0.25, 0],
                    extrapolate: 'clamp',
                  }),
                },
              ]}
            >
              <FakeGradient
                color="rgba(239,68,68,ALPHA)"
              />
            </Animated.View>

            {/* EDIT BUTTON */}
            <TouchableOpacity
              style={[
                styles.editBtn,
                {
                  borderColor: palette.borderStrong,
                  backgroundColor: palette.white,
                },
              ]}
            >
              <Text style={[styles.editBtnText, { color: palette.slate700 }]}>
                ✎
              </Text>
            </TouchableOpacity>

            {/* CARD CONTENT — TAP ANYWHERE */}
            <Pressable
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
              }}
              onPress={() => setShowTranslation(v => !v)}
            >
              <Text style={[styles.word, { color: palette.slate900 }]}>
                {showTranslation
                  ? currentPair.translation
                  : currentPair.word}
              </Text>

              <Text style={[styles.hint, { color: palette.slate500 }]}>
                ← swipe / tap / swipe →
              </Text>
            </Pressable>
          </Animated.View>
        </>
      )}
    </View>
  );
}
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Pressable,
  Platform,
} from 'react-native';

import type { WordPair } from '../../types/word';
import type { Palette } from '../../types/palette';
import { InputWithSuggestions } from '../../components/InputWithSuggestions';
import {
  IconClose,
  IconEdit,
  IconChat,
  IconCheck,
  IconArrowLeft,
  IconArrowRight,
} from '../../components/Icons';
import { FakeGradient } from '../../components/FakeGradient';
import { ThemeToggle } from '../../components/ThemeToggle';
import { ModalWithKeyboard } from '../../components/ModalWithKeyboard';
import { SentenceCheckModal } from '../../components/SentenceCheckModal/SentenceCheckModal';
import { useSuggestions } from '../../hooks/useSuggestions';
import { useThemePersistence, persistTheme } from '../../hooks/useThemePersistence';
import { pickWeightedIndex } from '../../utils/weightedRandom';
import { modalStyles } from '../../theme/modal.styles';
import { iconButtonStyles } from '../../theme/iconButton.styles';
import { styles } from './CardsScreen.styles';

const CARD_ICON_SIZE = 32;
const PRESS_ALPHA = 0.28;
const COLOR_KNOW = `rgba(50,255,149,${PRESS_ALPHA})`;
const COLOR_DONT_KNOW = `rgba(255,40,40,${PRESS_ALPHA})`;
const SHADOW_KNOW = 'rgb(50,255,149)';
const SHADOW_DONT_KNOW = 'rgb(255,40,40)';
const PRESSED_SHADOW = {
  shadowOpacity: 0.55,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 2 },
  elevation: 8,
};

const WORD_FONT_SIZE_BASE = 42;
const PHRASE_FONT_SIZE = 36;

/** Одно слово (без пробелов) — одна строка, при нехватке места уменьшаем шрифт. */
function getWordFontSize(text: string): number {
  const len = text.length;
  if (len <= 12) return WORD_FONT_SIZE_BASE;
  if (len <= 18) return 34;
  if (len <= 24) return 28;
  if (len <= 32) return 22;
  return 18;
}

/** Фраза (есть пробелы) — разрешаем перенос по строкам между словами, буквы одного слова не разрываем. */
function isPhrase(text: string): boolean {
  return text.trim().includes(' ');
}

type CardsScreenProps = {
  words: WordPair[];
  /** cb обновления серии посещений при монтировании */
  updateStreak: () => Promise<void>;
  palette: Palette;
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
}: CardsScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [sentenceCheckVisible, setSentenceCheckVisible] = useState(false);
  const [editWordValue, setEditWordValue] = useState('');
  const [editTranslationValue, setEditTranslationValue] = useState('');
  const [editWordError, setEditWordError] = useState('');

  const pan = useMemo(() => new Animated.ValueXY(), []);

  useThemePersistence(isDark, toggleTheme);

  const wordSuggestions = useSuggestions(
    words.map(w => w.word),
    editWordValue
  );
  const translationSuggestions = useSuggestions(
    words.map(w => w.translation),
    editTranslationValue
  );

  useEffect(() => {
    updateStreak();
  }, []);

  useEffect(() => {
    if (!words.length) return;
    pickRandomCard();
  }, [words]);

  const pickRandomCard = (excludeCurrentIndex?: number) => {
    if (!words.length) return;
    const exclude =
      words.length > 2 && excludeCurrentIndex !== undefined
        ? excludeCurrentIndex
        : undefined;
    const index = pickWeightedIndex(words, exclude);
    setCurrentIndex(index);
    setShowTranslation(Math.random() < 0.5);
  };

  const setTheme = async (dark: boolean) => {
    await persistTheme(dark);
    toggleTheme();
  };

  const safeIndex = words.length
    ? Math.min(currentIndex, words.length - 1)
    : 0;
  const currentPair = words[safeIndex];

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
    pickRandomCard(safeIndex);
  };

  const openEditModal = () => {
    if (!currentPair) return;
    setEditWordValue(currentPair.word);
    setEditTranslationValue(currentPair.translation);
    setEditWordError('');
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditWordValue('');
    setEditTranslationValue('');
    setEditWordError('');
  };

  const saveEdit = async () => {
    if (!currentPair) return;
    const word = editWordValue.trim();
    const translation = editTranslationValue.trim();
    if (!word) {
      setEditWordError('Введите слово');
      return;
    }
    setEditWordError('');
    await editWord(currentPair.id, word, translation, currentPair.score ?? 0);
    closeEditModal();
    pickRandomCard(safeIndex);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20,
        onPanResponderMove: Animated.event(
          [null, { dx: pan.x }],
          { useNativeDriver: false }
        ),
        onPanResponderRelease: (_, g) => {
          if (g.dx > 80) updateScore(1);
          else if (g.dx < -80) updateScore(-3);
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
      <View style={styles.headerRow}>
        <Text style={[styles.h1, { color: palette.slate900 }]}>Cards</Text>
        <ThemeToggle
          isDark={isDark}
          palette={palette}
          onSelectLight={() => isDark && setTheme(false)}
          onSelectDark={() => !isDark && setTheme(true)}
        />
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
              <FakeGradient color="rgba(50,255,149,ALPHA)" />
            </Animated.View>

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
              <FakeGradient color="rgba(255,40,40,ALPHA)" />
            </Animated.View>

            <Pressable
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 20,
                width: '100%',
              }}
              onPress={() => setShowTranslation(v => !v)}
            >
              {(() => {
                const displayText = showTranslation ? currentPair.translation : currentPair.word;
                return (
                  <>
                    <Text
                      numberOfLines={isPhrase(displayText) ? undefined : 1}
                      adjustsFontSizeToFit={!isPhrase(displayText) && Platform.OS === 'ios'}
                      minimumFontScale={0.35}
                      style={[
                        styles.word,
                        {
                          color: palette.slate900,
                          fontSize: isPhrase(displayText)
                            ? PHRASE_FONT_SIZE
                            : getWordFontSize(displayText),
                          maxWidth: '100%',
                        },
                      ]}
                    >
                      {displayText}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 15,
                      }}
                    >
                      <IconArrowLeft size={14} color={palette.slate500} />
                      <Text
                        style={[
                          styles.hint,
                          { color: palette.slate500, marginTop: 0 },
                        ]}
                      >
                        swipe / tap / swipe
                      </Text>
                      <IconArrowRight size={14} color={palette.slate500} />
                    </View>
                  </>
                );
              })()}
            </Pressable>

            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                paddingVertical: 16,
                gap: 20,
              }}
            >
              <Pressable
                style={({ pressed }) => [
                  iconButtonStyles.iconButton,
                  {
                    borderColor: palette.borderStrong,
                    backgroundColor: pressed ? COLOR_DONT_KNOW : palette.white,
                    zIndex: 10,
                    ...(pressed && {
                      shadowColor: SHADOW_DONT_KNOW,
                      ...PRESSED_SHADOW,
                    }),
                  },
                ]}
                onPress={() => updateScore(-3)}
              >
                <IconClose size={CARD_ICON_SIZE} color={palette.slate700} />
              </Pressable>
              <TouchableOpacity
                style={[
                  iconButtonStyles.iconButton,
                  {
                    borderColor: palette.borderStrong,
                    backgroundColor: palette.white,
                    zIndex: 10,
                  },
                ]}
                onPress={openEditModal}
              >
                <IconEdit size={CARD_ICON_SIZE} color={palette.slate700} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  iconButtonStyles.iconButton,
                  {
                    borderColor: palette.borderStrong,
                    backgroundColor: palette.white,
                    zIndex: 10,
                  },
                ]}
                onPress={() => setSentenceCheckVisible(true)}
              >
                <IconChat size={CARD_ICON_SIZE} color={palette.slate700} />
              </TouchableOpacity>
              <Pressable
                style={({ pressed }) => [
                  iconButtonStyles.iconButton,
                  {
                    borderColor: palette.borderStrong,
                    backgroundColor: pressed ? COLOR_KNOW : palette.white,
                    zIndex: 10,
                    ...(pressed && {
                      shadowColor: SHADOW_KNOW,
                      ...PRESSED_SHADOW,
                    }),
                  },
                ]}
                onPress={() => updateScore(1)}
              >
                <IconCheck size={CARD_ICON_SIZE} color={palette.slate700} />
              </Pressable>
            </View>
          </Animated.View>

          <ModalWithKeyboard
            visible={editModalVisible}
            palette={palette}
            keyboardVerticalOffset={64}
          >
            <Text style={[modalStyles.title, { color: palette.slate900 }]}>
              Редактировать
            </Text>
            <InputWithSuggestions
              value={editWordValue}
              onChangeText={setEditWordValue}
              placeholder="Английское слово"
              suggestions={wordSuggestions}
              onSelect={setEditWordValue}
              palette={palette}
              error={editWordError}
              keyboardType="ascii-capable"
            />
            <InputWithSuggestions
              value={editTranslationValue}
              onChangeText={setEditTranslationValue}
              placeholder="Русский перевод"
              suggestions={translationSuggestions}
              onSelect={setEditTranslationValue}
              palette={palette}
            />
            <View style={modalStyles.buttonsGroup}>
              <TouchableOpacity
                style={[
                  modalStyles.iconButton,
                  {
                    backgroundColor: palette.white,
                    borderColor: palette.borderStrong,
                  },
                ]}
                onPress={closeEditModal}
              >
                <IconClose size={CARD_ICON_SIZE} color={palette.slate700} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  modalStyles.iconButton,
                  {
                    backgroundColor: palette.white,
                    borderColor: palette.borderStrong,
                  },
                ]}
                onPress={saveEdit}
              >
                <IconCheck size={CARD_ICON_SIZE} color={palette.slate700} />
              </TouchableOpacity>
            </View>
          </ModalWithKeyboard>

          <SentenceCheckModal
            visible={sentenceCheckVisible}
            onClose={() => setSentenceCheckVisible(false)}
            word={currentPair.word}
            palette={palette}
          />
        </>
      )}
    </View>
  );
}

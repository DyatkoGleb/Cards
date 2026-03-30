import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Pressable,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Folder, TrainingSetSelection, WordPair } from '../../types/word';
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
import { FolderPickerField } from '../../components/FolderPickerField';
import { SentenceCheckModal } from '../../components/SentenceCheckModal/SentenceCheckModal';
import { useSuggestions } from '../../hooks/useSuggestions';
import { useThemePersistence, persistTheme } from '../../hooks/useThemePersistence';
import { pickWeightedIndex } from '../../utils/weightedRandom';
import { A11Y } from '../../config/accessibility';
import { TRAINING_MODE_FOLDER, TRAINING_MODE_GENERAL } from '../../config/featureFlags';
import { modalStyles } from '../../theme/modal.styles';
import { iconButtonStyles } from '../../theme/iconButton.styles';
import { styles } from './CardsScreen.styles';
import { CARDS_SWIPE_HINT_DISMISSED_KEY } from '../../utils/storageKeys';

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
    score: number,
    options?: { folderIds?: string[]; showInGeneralSet?: boolean }
  ) => Promise<void>;
  folders: Folder[];
  selectedSet: TrainingSetSelection;
  setSelectedSet: (next: TrainingSetSelection) => Promise<void>;
  retryTranscription: (id: string) => Promise<void>;
};

export function CardsScreen({
  words,
  updateStreak,
  palette,
  isDark,
  toggleTheme,
  editWord,
  folders,
  selectedSet,
  setSelectedSet,
  retryTranscription,
}: CardsScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [sentenceCheckVisible, setSentenceCheckVisible] = useState(false);
  const [editWordValue, setEditWordValue] = useState('');
  const [editTranslationValue, setEditTranslationValue] = useState('');
  const [editWordError, setEditWordError] = useState('');
  const [editSelectedFolderId, setEditSelectedFolderId] = useState<string | null>(null);
  const [editShowInGeneralSet, setEditShowInGeneralSet] = useState(true);
  /** null = ещё не прочитали AsyncStorage; false = показываем подсказку до первого свайпа */
  const [swipeHintDismissed, setSwipeHintDismissed] = useState<boolean | null>(null);
  const swipeHintDismissedRef = useRef(false);

  const pan = useMemo(() => new Animated.ValueXY(), []);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(CARDS_SWIPE_HINT_DISMISSED_KEY);
      const dismissed = raw === 'true';
      swipeHintDismissedRef.current = dismissed;
      setSwipeHintDismissed(dismissed);
    })();
  }, []);

  useThemePersistence(isDark, toggleTheme);

  const wordSuggestions = useSuggestions(
    words.map(w => w.word),
    editWordValue
  );
  const translationSuggestions = useSuggestions(
    words.map(w => w.translation),
    editTranslationValue
  );

  const activeWords = useMemo(() => {
    if (selectedSet.mode === TRAINING_MODE_FOLDER && selectedSet.folderId) {
      return words.filter(w => (w.folderIds ?? []).includes(selectedSet.folderId!));
    }
    return words.filter(w => w.showInGeneralSet !== false);
  }, [words, selectedSet]);

  const pickRandomCard = useCallback((excludeCurrentIndex?: number) => {
    if (!activeWords.length) return;
    const exclude =
      activeWords.length > 2 && excludeCurrentIndex !== undefined
        ? excludeCurrentIndex
        : undefined;
    const index = pickWeightedIndex(activeWords, exclude);
    setCurrentIndex(index);
    setShowTranslation(Math.random() < 0.5);
  }, [activeWords]);

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  useEffect(() => {
    if (!activeWords.length) return;
    pickRandomCard();
  }, [activeWords, selectedSet, pickRandomCard]);

  const setTheme = async (dark: boolean) => {
    await persistTheme(dark);
    toggleTheme();
  };

  const safeIndex = activeWords.length
    ? Math.min(currentIndex, activeWords.length - 1)
    : 0;
  const currentPair = activeWords[safeIndex];

  const updateScore = useCallback(async (delta: number) => {
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
  }, [currentPair, editWord, pickRandomCard, safeIndex]);

  const openEditModal = () => {
    if (!currentPair) return;
    setEditWordValue(currentPair.word);
    setEditTranslationValue(currentPair.translation);
    setEditSelectedFolderId((currentPair.folderIds ?? [])[0] ?? null);
    setEditShowInGeneralSet(currentPair.showInGeneralSet ?? true);
    setEditWordError('');
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditWordValue('');
    setEditTranslationValue('');
    setEditSelectedFolderId(null);
    setEditShowInGeneralSet(true);
    setEditWordError('');
  };

  const dismissSwipeHintAfterSwipe = useCallback(async () => {
    if (swipeHintDismissedRef.current) return;
    swipeHintDismissedRef.current = true;
    setSwipeHintDismissed(true);
    await AsyncStorage.setItem(CARDS_SWIPE_HINT_DISMISSED_KEY, 'true');
  }, []);

  const cardForEdit = useMemo(() => {
    if (!editModalVisible || !currentPair) return null;
    return words.find(w => w.id === currentPair.id) ?? currentPair;
  }, [editModalVisible, currentPair, words]);

  const saveEdit = async () => {
    if (!currentPair) return;
    const word = editWordValue.trim();
    const translation = editTranslationValue.trim();
    if (!word) {
      setEditWordError('Введите слово');
      return;
    }
    setEditWordError('');
    await editWord(currentPair.id, word, translation, currentPair.score ?? 0, {
      folderIds: editSelectedFolderId ? [editSelectedFolderId] : [],
      showInGeneralSet: editShowInGeneralSet,
    });
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
          const swipedKnow = g.dx > 80;
          const swipedDontKnow = g.dx < -80;
          if (swipedKnow || swipedDontKnow) {
            void dismissSwipeHintAfterSwipe();
          }
          if (swipedKnow) updateScore(1);
          else if (swipedDontKnow) updateScore(-3);
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        },
      }),
    [pan, updateScore, dismissSwipeHintAfterSwipe]
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.setSelectorScroll}
        contentContainerStyle={styles.setSelectorScrollContent}
      >
        <TouchableOpacity
          accessibilityLabel={A11Y.cards.selectGeneral}
          onPress={() => setSelectedSet({ mode: TRAINING_MODE_GENERAL, folderId: null })}
          style={[styles.setPill, {
            borderColor: selectedSet.mode === TRAINING_MODE_GENERAL ? palette.blueDeep : palette.borderStrong,
            backgroundColor: selectedSet.mode === TRAINING_MODE_GENERAL ? palette.blueSoft : palette.white,
          }]}
        >
          <Text style={{ color: palette.slate700 }}>General</Text>
        </TouchableOpacity>
        {folders.map(folder => {
          const active =
            selectedSet.mode === TRAINING_MODE_FOLDER &&
            selectedSet.folderId === folder.id;
          return (
            <TouchableOpacity
              key={folder.id}
              accessibilityLabel={`${A11Y.cards.selectFolderPrefix} ${folder.name}`}
              onPress={() =>
                setSelectedSet({ mode: TRAINING_MODE_FOLDER, folderId: folder.id })
              }
              style={[styles.setPill, {
                borderColor: active ? palette.blueDeep : palette.borderStrong,
                backgroundColor: active ? palette.blueSoft : palette.white,
              }]}
            >
              <Text style={{ color: palette.slate700 }}>{folder.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {!!activeWords.length && (
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
              style={styles.cardPressArea}
              onPress={() => setShowTranslation(v => !v)}
              accessibilityLabel={A11Y.cards.flip}
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
                    {currentPair.transcription ? (
                      <Text
                        style={[
                          styles.hint,
                          {
                            color: palette.slate500,
                            marginTop: 8,
                            fontSize: 15,
                          },
                        ]}
                      >
                        {currentPair.transcription}
                      </Text>
                    ) : null}
                    {currentPair.transcriptionStatus === 'pending' ? (
                      <Text style={[styles.hint, { color: palette.slate500, marginTop: 6 }]}>
                        Looking up transcription...
                      </Text>
                    ) : null}
                    {currentPair.transcriptionStatus === 'failed' ? (
                      <TouchableOpacity onPress={() => retryTranscription(currentPair.id)}>
                        <Text style={[styles.hint, { color: palette.blueDeep, marginTop: 6 }]}>
                          Retry transcription
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                    {swipeHintDismissed === false ? (
                      <View style={[styles.wordRow, { marginTop: 10 }]}>
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
                    ) : null}
                  </>
                );
              })()}
            </Pressable>

            <View style={styles.actionRow}>
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
                accessibilityLabel={A11Y.cards.markDontKnow}
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
                accessibilityLabel={A11Y.cards.edit}
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
                accessibilityLabel={A11Y.cards.sentenceCheck}
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
                accessibilityLabel={A11Y.cards.markKnow}
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
              compact
            />
            <InputWithSuggestions
              value={editTranslationValue}
              onChangeText={setEditTranslationValue}
              placeholder="Русский перевод"
              suggestions={translationSuggestions}
              onSelect={setEditTranslationValue}
              palette={palette}
              compact
            />
            <FolderPickerField
              folders={folders}
              selectedFolderId={editSelectedFolderId}
              onSelect={setEditSelectedFolderId}
              palette={palette}
              compact
            />
            {cardForEdit?.transcription ? (
              <Text
                style={[styles.hint, { color: palette.slate500, textAlign: 'center', marginTop: 4 }]}
              >
                {cardForEdit.transcription}
              </Text>
            ) : null}
            {cardForEdit?.transcriptionStatus === 'pending' ? (
              <Text style={[styles.hint, { color: palette.slate500, textAlign: 'center' }]}>
                Looking up transcription...
              </Text>
            ) : null}
            {cardForEdit?.transcriptionStatus === 'failed' ? (
              <TouchableOpacity onPress={() => cardForEdit && retryTranscription(cardForEdit.id)}>
                <Text style={[styles.hint, { color: palette.blueDeep, textAlign: 'center' }]}>
                  Retry transcription
                </Text>
              </TouchableOpacity>
            ) : null}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.hint, { color: palette.slate700 }]}>Show in general set</Text>
              <Switch value={editShowInGeneralSet} onValueChange={setEditShowInGeneralSet} />
            </View>
            <View style={modalStyles.buttonsGroup}>
              <TouchableOpacity
                style={[
                  modalStyles.iconButton,
                  { backgroundColor: palette.white },
                ]}
                onPress={closeEditModal}
              >
                <IconClose size={CARD_ICON_SIZE} color={palette.slate700} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  modalStyles.iconButton,
                  { backgroundColor: palette.white },
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

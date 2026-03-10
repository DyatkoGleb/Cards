import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { styles } from './ProfileScreen.styles';
import { InputWithSuggestions } from '../../components/InputWithSuggestions';
import { IconArrowRight, IconClose, IconCheck, IconTrash } from '../../components/Icons';
import { ModalWithKeyboard } from '../../components/ModalWithKeyboard';
import { useSuggestions } from '../../hooks/useSuggestions';
import { useGeminiKey } from '../../hooks/useGeminiKey';
import { modalStyles } from '../../theme/modal.styles';
import type { Stats, WordPair } from '../../types/word';
import type { Palette } from '../../types/palette';

type ProfileScreenProps = {
  words: WordPair[];
  stats: Stats;
  deleteWord: (id: string) => Promise<void>;
  editWord: (id: string, word: string, translation: string) => Promise<void>;
  palette: Palette;
};

export function ProfileScreen({
  words,
  stats,
  deleteWord,
  editWord,
  palette,
}: ProfileScreenProps) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<WordPair | null>(null);
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [geminiModalVisible, setGeminiModalVisible] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');

  const [savedGeminiKey, , saveGeminiKey] = useGeminiKey();

  const filteredWords = useMemo(() => {
    if (!search.trim()) return words;
    const q = search.toLowerCase();
    return words.filter(
      w =>
        w.word.toLowerCase().includes(q) ||
        w.translation.toLowerCase().includes(q)
    );
  }, [words, search]);

  const wordSuggestions = useSuggestions(
    words.filter(w => w.id !== editing?.id).map(w => w.word),
    word
  );

  const translationSuggestions = useSuggestions(
    words.filter(w => w.id !== editing?.id).map(w => w.translation),
    translation
  );

  const openEdit = (item: WordPair) => {
    setEditing(item);
    setWord(item.word);
    setTranslation(item.translation);
    setError('');
    setModalVisible(true);
  };

  const openGeminiModal = () => {
    setGeminiKeyInput(savedGeminiKey);
    setGeminiModalVisible(true);
  };

  const handleSaveGeminiKey = async () => {
    await saveGeminiKey(geminiKeyInput);
    setGeminiModalVisible(false);
  };

  const handleSave = async () => {
    if (!editing) return;

    if (!word.trim()) {
      setError('Введите слово');
      return;
    }

    const exists = words.some(
      w =>
        w.id !== editing.id &&
        w.word.toLowerCase() === word.trim().toLowerCase()
    );

    if (exists) {
      setError('Это слово уже есть');
      return;
    }

    await editWord(editing.id, word.trim(), translation.trim());
    setModalVisible(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!editing) return;

    const idToDelete = editing.id;
    const wordLabel = editing.word;

    Alert.alert(
      'Delete pair',
      `Delete "${wordLabel}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setModalVisible(false);
            setEditing(null);
            setError('');
            try {
              await deleteWord(idToDelete);
            } catch {
              setError('Не удалось удалить');
            }
          },
        },
      ]
    );
  };

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekWords = words.filter(w => w.createdAt >= weekAgo).length;

  return (
    <ScrollView
      style={[styles.content, { backgroundColor: palette.page }]}
      contentContainerStyle={styles.contentInner}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerRow}>
        <Text style={[styles.h1, { color: palette.slate900 }]}>
          Profile
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.headerPillButton,
              { backgroundColor: palette.border },
            ]}
            onPress={openGeminiModal}
          >
            <Text
              style={[
                styles.headerPillButtonText,
                { color: palette.slate700 },
              ]}
            >
              Gemini
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[
          styles.profileCard,
          { backgroundColor: palette.white, borderColor: palette.border },
        ]}
      >
        <View
          style={[styles.avatar, { backgroundColor: palette.blueSoft }]}
        />
        <Text style={[styles.name, { color: palette.slate900 }]}>
          Name
        </Text>
        <Text style={[styles.subtitle, { color: palette.slate500 }]}>
          Learning every day
        </Text>
        <Text style={[styles.note, { color: palette.blueDeep }]}>
          Lifetime vocabulary: {stats.totalWords} words
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.stat, { backgroundColor: palette.blueSoft }]}>
          <Text style={[styles.statText, { color: palette.blueDeep }]}>
            {stats.totalWords}
            {'\n'}WORDS
          </Text>
        </View>
        <View style={[styles.stat, { backgroundColor: palette.greenSoft }]}>
          <Text style={[styles.statText, { color: palette.greenDeep }]}>
            {weekWords}
            {'\n'}WEEK
          </Text>
        </View>
        <View style={[styles.stat, { backgroundColor: palette.orangeSoft }]}>
          <Text style={[styles.statText, { color: palette.orangeDeep }]}>
            {stats.streak}
            {'\n'}DAY STREAK
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: palette.white, borderColor: palette.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: palette.slate900 }]}>
          All word pairs
        </Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search"
          placeholderTextColor={palette.slate400}
          style={[
            styles.searchInput,
            {
              borderColor: palette.borderStrong,
              color: palette.slate900,
              backgroundColor: palette.white,
            },
          ]}
        />

        {filteredWords.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.row,
              {
                backgroundColor: palette.white,
                borderColor: palette.border,
              },
            ]}
            onPress={() => openEdit(item)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={[styles.rowText, { color: palette.slate700 }]}>{item.word}</Text>
              <IconArrowRight size={14} color={palette.slate500} />
              <Text style={[styles.rowText, { color: palette.slate700 }]}>{item.translation}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ModalWithKeyboard
        visible={modalVisible}
        palette={palette}
        keyboardVerticalOffset={40}
      >
        <Text style={[modalStyles.title, { color: palette.slate900 }]}>
          Edit pair
        </Text>
        <InputWithSuggestions
          value={word}
          onChangeText={setWord}
          placeholder="Английское слово"
          suggestions={wordSuggestions}
          onSelect={setWord}
          palette={palette}
          error={error}
        />
        <InputWithSuggestions
          value={translation}
          onChangeText={setTranslation}
          placeholder="Русский перевод"
          suggestions={translationSuggestions}
          onSelect={setTranslation}
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
            onPress={handleDelete}
          >
            <IconTrash size={28} color={palette.slate700} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              modalStyles.iconButton,
              {
                backgroundColor: palette.white,
                borderColor: palette.borderStrong,
              },
            ]}
            onPress={() => setModalVisible(false)}
          >
            <IconClose size={28} color={palette.slate700} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              modalStyles.iconButton,
              {
                backgroundColor: palette.white,
                borderColor: palette.borderStrong,
              },
            ]}
            onPress={handleSave}
          >
            <IconCheck size={28} color={palette.slate700} />
          </TouchableOpacity>
        </View>
      </ModalWithKeyboard>

      <ModalWithKeyboard
        visible={geminiModalVisible}
        palette={palette}
        keyboardVerticalOffset={40}
      >
        <Text style={[modalStyles.title, { color: palette.slate900 }]}>
          Gemini API Key
        </Text>
        <TextInput
          value={geminiKeyInput}
          onChangeText={setGeminiKeyInput}
          placeholder="Введите API-ключ"
          placeholderTextColor={palette.slate400}
          secureTextEntry
          style={[
            styles.geminiKeyInput,
            {
              borderColor: palette.borderStrong,
              color: palette.slate900,
              backgroundColor: palette.white,
            },
          ]}
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
            onPress={() => setGeminiModalVisible(false)}
          >
            <IconClose size={28} color={palette.slate700} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              modalStyles.iconButton,
              {
                backgroundColor: palette.white,
                borderColor: palette.borderStrong,
              },
            ]}
            onPress={handleSaveGeminiKey}
          >
            <IconCheck size={28} color={palette.slate700} />
          </TouchableOpacity>
        </View>
      </ModalWithKeyboard>
    </ScrollView>
  );
}
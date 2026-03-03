import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { exportBackup, importBackup } from '../../utils/backup';
import { styles } from './ProfileScreen.styles';
import { InputWithSuggestions } from '../../components/InputWithSuggestions';
import { useSuggestions } from '../../hooks/useSuggestions';
import { Stats, WordPair } from '../../types/word';

type Props = {
  words: WordPair[];
  stats: Stats;
  deleteWord: (id: string) => Promise<void>;
  editWord: (id: string, word: string, translation: string) => Promise<void>;
  palette: any;
  replaceAll: (nextWords: WordPair[], nextStats: Stats) => Promise<void>;
};

export function ProfileScreen({
  words,
  stats,
  deleteWord,
  editWord,
  replaceAll,
  palette,
}: Props) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<WordPair | null>(null);
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

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

    Alert.alert(
      'Delete pair',
      `Delete "${editing.word}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteWord(editing.id);
            setModalVisible(false);
            setEditing(null);
          },
        },
      ]
    );
  };

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekWords = words.filter(w => w.createdAt >= weekAgo).length;

  const handleExport = async () => {
    await exportBackup({
      words,
      stats,
    });
  };
  
  const handleImport = async () => {
    const data = await importBackup();
    if (!data) return;
  
    Alert.alert(
      'Импорт данных',
      'Текущие данные будут перезаписаны. Продолжить?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Импортировать',
          style: 'destructive',
          onPress: async () => {
            await replaceAll(data.words, data.stats);
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.content, { backgroundColor: palette.page }]}
      contentContainerStyle={styles.contentInner}
      keyboardShouldPersistTaps="handled"
    >
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={[styles.h1, { color: palette.slate900 }]}>
          Profile
        </Text>

        <View style={[styles.toggle, { backgroundColor: palette.border }]}>
          <TouchableOpacity
            style={[
              styles.toggleLight,
              { backgroundColor: palette.white },
            ]}
            onPress={handleExport}
          >
            <Text
              style={{
                color: palette.slate500,
                fontSize: 10,
                fontWeight: '600',
              }}
            >
              Export
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleDark,
              { backgroundColor: palette.white },
            ]}
            onPress={handleImport}
          >
            <Text
              style={{
                color: palette.slate500,
                fontSize: 10,
                fontWeight: '600',
              }}
            >
              Import
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PROFILE CARD */}
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

      {/* STATS */}
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

      {/* WORD LIST */}
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
            <Text style={[styles.rowText, { color: palette.slate700 }]}>
              {item.word} → {item.translation} → {item.score}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
            style={{ width: '100%', alignItems: 'center' }}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: palette.white },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  { color: palette.slate900 },
                ]}
              >
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

              <View style={styles.modalButtonsRow}>
                <View style={styles.modalButtonsGroup}>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      { backgroundColor: palette.slate400 },
                    ]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>Отмена</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      { backgroundColor: palette.blue },
                    ]}
                    onPress={handleSave}
                  >
                    <Text style={styles.buttonText}>Сохранить</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: palette.red },
                  ]}
                  onPress={handleDelete}
                >
                  <Text style={styles.buttonText}>Удалить</Text>
                </TouchableOpacity>
              </View>
              </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ScrollView>
  );
}
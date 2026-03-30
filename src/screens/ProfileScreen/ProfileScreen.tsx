import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { styles } from './ProfileScreen.styles';
import { InputWithSuggestions } from '../../components/InputWithSuggestions';
import { IconArrowRight, IconClose, IconCheck, IconTrash, IconPlus, IconChat } from '../../components/Icons';
import { ModalWithKeyboard } from '../../components/ModalWithKeyboard';
import { useSuggestions } from '../../hooks/useSuggestions';
import { useGeminiKey } from '../../hooks/useGeminiKey';
import { modalStyles } from '../../theme/modal.styles';
import type { Folder, Stats, WordPair } from '../../types/word';
import type { Palette } from '../../types/palette';
import { SentenceCheckModal } from '../../components/SentenceCheckModal/SentenceCheckModal';
import { FolderPickerField } from '../../components/FolderPickerField';

type ProfileScreenProps = {
  words: WordPair[];
  stats: Stats;
  deleteWord: (id: string) => Promise<void>;
  editWord: (
    id: string,
    word: string,
    translation: string,
    score?: number,
    options?: { folderIds?: string[]; showInGeneralSet?: boolean }
  ) => Promise<void>;
  folders: Folder[];
  addFolder: (name: string) => Promise<Folder | null>;
  palette: Palette;
  onRequestAddWord: (prefill?: { word?: string; translation?: string }) => void;
  retryTranscription: (id: string) => Promise<void>;
};

export function ProfileScreen({
  words,
  stats,
  deleteWord,
  editWord,
  folders,
  addFolder,
  palette,
  onRequestAddWord,
  retryTranscription,
}: ProfileScreenProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'words' | 'folders'>('words');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [editing, setEditing] = useState<WordPair | null>(null);
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [error, setError] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showInGeneralSet, setShowInGeneralSet] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [sentenceCheckVisible, setSentenceCheckVisible] = useState(false);
  const [resumeEditAfterSentence, setResumeEditAfterSentence] = useState(false);
  const [geminiModalVisible, setGeminiModalVisible] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderError, setFolderError] = useState('');
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(
    () => new Set()
  );

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

  const filteredFolders = useMemo(() => {
    if (!search.trim()) return folders;
    const q = search.toLowerCase();
    return folders.filter(f => f.name.toLowerCase().includes(q));
  }, [folders, search]);

  const searchLooksCyrillic = useMemo(
    () => /[А-Яа-яЁё]/.test(search.trim()),
    [search]
  );
  const hasNoSearchResults = !!search.trim() && filteredWords.length === 0;

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
    setSelectedFolderId((item.folderIds ?? [])[0] ?? null);
    setShowInGeneralSet(item.showInGeneralSet ?? true);
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

  const handleAddFolder = async () => {
    const trimmed = newFolderName.trim();
    if (!trimmed) {
      setFolderError('Введите название папки');
      return;
    }
    await addFolder(trimmed);
    setFolderError('');
    setNewFolderName('');
    setFolderModalVisible(false);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setShowScrollTop(e.nativeEvent.contentOffset.y > 180);
  };

  const toggleFolderExpand = (folderId: string) => {
    setExpandedFolderIds(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
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

    await editWord(editing.id, word.trim(), translation.trim(), editing.score, {
      folderIds: selectedFolderId ? [selectedFolderId] : [],
      showInGeneralSet,
    });
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

  const openSentenceCheckFromEdit = () => {
    setResumeEditAfterSentence(true);
    setModalVisible(false);
    setSentenceCheckVisible(true);
  };

  const closeSentenceCheck = () => {
    setSentenceCheckVisible(false);
    if (resumeEditAfterSentence) {
      setResumeEditAfterSentence(false);
      setModalVisible(true);
    }
  };

  return (
    <>
    <ScrollView
      ref={scrollRef}
      style={[styles.content, { backgroundColor: palette.page }]}
      contentContainerStyle={styles.contentInner}
      keyboardShouldPersistTaps="handled"
      onScroll={handleScroll}
      scrollEventThrottle={16}
      stickyHeaderIndices={[4]}
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
            accessibilityLabel="Open Gemini key dialog"
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
            {stats.weekWords}
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

      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[
            styles.tabHalf,
            {
              borderBottomColor:
                activeTab === 'words' ? palette.blueDeep : 'transparent',
            },
          ]}
          onPress={() => setActiveTab('words')}
          accessibilityLabel="Words tab"
          accessibilityState={{ selected: activeTab === 'words' }}
        >
          <Text
            style={[
              styles.rowText,
              {
                color: palette.slate700,
                fontWeight: activeTab === 'words' ? '700' : '500',
              },
            ]}
          >
            Words
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabHalf,
            {
              borderBottomColor:
                activeTab === 'folders' ? palette.blueDeep : 'transparent',
            },
          ]}
          onPress={() => setActiveTab('folders')}
          accessibilityLabel="Folders tab"
          accessibilityState={{ selected: activeTab === 'folders' }}
        >
          <Text
            style={[
              styles.rowText,
              {
                color: palette.slate700,
                fontWeight: activeTab === 'folders' ? '700' : '500',
              },
            ]}
          >
            Folders
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.stickySearchWrap,
          {
            backgroundColor: palette.page,
          },
        ]}
      >
        <View style={styles.searchRow}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={activeTab === 'words' ? 'Search words' : 'Search folders'}
            placeholderTextColor={palette.slate400}
            style={[
              styles.searchInput,
              styles.searchInputFlex,
              {
                borderColor: palette.borderStrong,
                color: palette.slate900,
                backgroundColor: palette.white,
              },
            ]}
          />
          {showScrollTop && (
            <TouchableOpacity
              style={[
                styles.scrollTopBtn,
                { borderColor: palette.borderStrong, backgroundColor: palette.white },
              ]}
              onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
              accessibilityLabel="Scroll to top"
            >
              <Text style={{ color: palette.slate700, fontSize: 18 }}>↑</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {activeTab === 'words' ? (
        <View
          style={[
            styles.section,
            { backgroundColor: palette.white, borderColor: palette.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: palette.slate900 }]}>
            All word pairs
          </Text>

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
              <View style={styles.rowWordPair}>
                <Text style={[styles.rowText, { color: palette.slate700 }]}>{item.word}</Text>
                <IconArrowRight size={14} color={palette.slate500} />
                <Text style={[styles.rowText, { color: palette.slate700 }]}>{item.translation}</Text>
              </View>
              {item.transcriptionStatus === 'pending' ? (
                <Text style={[styles.rowText, { color: palette.slate500, fontSize: 12 }]}>
                  Looking up transcription...
                </Text>
              ) : null}
              {item.transcription ? (
                <Text style={[styles.rowText, { color: palette.slate500, fontSize: 12 }]}>
                  {item.transcription}
                </Text>
              ) : null}
              {item.transcriptionStatus === 'failed' ? (
                <TouchableOpacity onPress={() => retryTranscription(item.id)}>
                  <Text style={[styles.rowText, { color: palette.blueDeep, fontSize: 12 }]}>
                    Retry transcription
                  </Text>
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
          ))}
          {hasNoSearchResults && (
            <TouchableOpacity
              style={[
                styles.row,
                {
                  backgroundColor: palette.blueSoft,
                  borderColor: palette.blueDeep,
                },
              ]}
              onPress={() =>
                onRequestAddWord(
                  searchLooksCyrillic
                    ? { translation: search.trim() }
                    : { word: search.trim() }
                )
              }
            >
              <Text style={[styles.rowText, { color: palette.blueDeep }]}>
                No results. Add new word from search.
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View
          style={[
            styles.section,
            { backgroundColor: palette.white, borderColor: palette.border },
          ]}
        >
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: palette.slate900 }]}>
              Folders
            </Text>
            <TouchableOpacity
              style={styles.folderAddBtn}
              onPress={() => setFolderModalVisible(true)}
              accessibilityLabel="Add folder"
            >
              <IconPlus size={22} color={palette.slate700} />
            </TouchableOpacity>
          </View>
          {filteredFolders.map(folder => {
            const expanded = expandedFolderIds.has(folder.id);
            const folderWords = words.filter(w =>
              (w.folderIds ?? []).includes(folder.id)
            );
            return (
              <View key={folder.id}>
                <TouchableOpacity
                  style={[
                    styles.row,
                    {
                      backgroundColor: palette.white,
                      borderColor: palette.border,
                    },
                  ]}
                  onPress={() => toggleFolderExpand(folder.id)}
                  accessibilityLabel={`Folder ${folder.name}`}
                  accessibilityState={{ expanded }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <Text style={[styles.rowText, { color: palette.slate700 }]}>
                      {folder.name}
                    </Text>
                    <Text style={{ color: palette.slate500, fontSize: 12 }}>
                      {expanded ? '▼' : '▶'}
                    </Text>
                  </View>
                </TouchableOpacity>
                {expanded && folderWords.length === 0 ? (
                  <Text
                    style={{
                      marginLeft: 16,
                      marginBottom: 8,
                      fontSize: 12,
                      color: palette.slate500,
                    }}
                  >
                    No words in this folder
                  </Text>
                ) : null}
                {expanded
                  ? folderWords.map(item => (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.folderWordRow,
                          {
                            borderColor: palette.border,
                            backgroundColor: palette.page,
                          },
                        ]}
                        onPress={() => openEdit(item)}
                      >
                        <View style={styles.rowWordPair}>
                          <Text style={[styles.rowText, { color: palette.slate700 }]}>
                            {item.word}
                          </Text>
                          <IconArrowRight size={14} color={palette.slate500} />
                          <Text style={[styles.rowText, { color: palette.slate700 }]}>
                            {item.translation}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  : null}
              </View>
            );
          })}
          {!!search.trim() && filteredFolders.length === 0 ? (
            <Text style={[styles.rowText, { color: palette.slate500, paddingVertical: 8 }]}>
              No folders match your search
            </Text>
          ) : null}
        </View>
      )}

      <ModalWithKeyboard
        visible={folderModalVisible}
        palette={palette}
        keyboardVerticalOffset={40}
      >
        <Text style={[modalStyles.title, { color: palette.slate900 }]}>
          New folder
        </Text>
        <InputWithSuggestions
          value={newFolderName}
          onChangeText={setNewFolderName}
          placeholder="Folder name"
          suggestions={[]}
          onSelect={setNewFolderName}
          palette={palette}
          error={folderError}
        />
        <View style={modalStyles.buttonsGroup}>
          <TouchableOpacity
            style={[
              modalStyles.iconButton,
              { backgroundColor: palette.white },
            ]}
            onPress={() => setFolderModalVisible(false)}
          >
            <IconClose size={28} color={palette.slate700} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              modalStyles.iconButton,
              { backgroundColor: palette.white },
            ]}
            onPress={handleAddFolder}
          >
            <IconCheck size={28} color={palette.slate700} />
          </TouchableOpacity>
        </View>
      </ModalWithKeyboard>

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
          compact
        />
        <InputWithSuggestions
          value={translation}
          onChangeText={setTranslation}
          placeholder="Русский перевод"
          suggestions={translationSuggestions}
          onSelect={setTranslation}
          palette={palette}
          compact
        />
        <FolderPickerField
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelect={setSelectedFolderId}
          palette={palette}
          compact
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.rowText, { color: palette.slate700 }]}>Show in general set</Text>
          <Switch value={showInGeneralSet} onValueChange={setShowInGeneralSet} />
        </View>
        <View style={modalStyles.buttonsGroup}>
          <TouchableOpacity
            style={[
              modalStyles.iconButton,
              { backgroundColor: palette.white },
            ]}
            onPress={openSentenceCheckFromEdit}
            accessibilityLabel="Open sentence checker"
          >
            <IconChat size={28} color={palette.slate700} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              modalStyles.iconButton,
              { backgroundColor: palette.white },
            ]}
            onPress={handleDelete}
            accessibilityLabel="Delete word pair"
          >
            <IconTrash size={28} color={palette.slate700} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              modalStyles.iconButton,
              { backgroundColor: palette.white },
            ]}
            onPress={() => setModalVisible(false)}
            accessibilityLabel="Close edit dialog"
          >
            <IconClose size={28} color={palette.slate700} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              modalStyles.iconButton,
              { backgroundColor: palette.white },
            ]}
            onPress={handleSave}
            accessibilityLabel="Save edited pair"
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
              { backgroundColor: palette.white },
            ]}
            onPress={() => setGeminiModalVisible(false)}
            accessibilityLabel="Close Gemini key dialog"
          >
            <IconClose size={28} color={palette.slate700} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              modalStyles.iconButton,
              { backgroundColor: palette.white },
            ]}
            onPress={handleSaveGeminiKey}
            accessibilityLabel="Save Gemini key"
          >
            <IconCheck size={28} color={palette.slate700} />
          </TouchableOpacity>
        </View>
      </ModalWithKeyboard>
    </ScrollView>
    <SentenceCheckModal
      visible={sentenceCheckVisible}
      onClose={closeSentenceCheck}
      word={editing?.word ?? word.trim()}
      palette={palette}
    />
    </>
  );
}
import React, { useEffect, useMemo, useState } from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import { InputWithSuggestions } from '../InputWithSuggestions';
import { FolderPickerField } from '../FolderPickerField';
import { ModalWithKeyboard } from '../ModalWithKeyboard';
import { IconClose, IconCheck } from '../Icons';
import { useSuggestions } from '../../hooks/useSuggestions';
import { modalStyles } from '../../theme/modal.styles';
import type { Folder, WordPair } from '../../types/word';
import type { Palette } from '../../types/palette';

const MODAL_ICON_SIZE = 28;

export type AddWordModalProps = {
  words: WordPair[];
  folders: Folder[];
  visible: boolean;
  onClose: () => void;
  palette: Palette;
  initialWord?: string;
  initialTranslation?: string;
  addWord: (
    word: string,
    translation: string,
    options?: { folderIds?: string[]; showInGeneralSet?: boolean }
  ) => Promise<WordPair | void>;
  editWord: (
    id: string,
    word: string,
    translation: string,
    score?: number,
    options?: { folderIds?: string[]; showInGeneralSet?: boolean }
  ) => Promise<void>;
};

export function AddWordModal({
  words,
  folders,
  visible,
  onClose,
  palette,
  initialWord,
  initialTranslation,
  addWord,
  editWord,
}: AddWordModalProps) {
  const [newWord, setNewWord] = useState('');
  const [wordError, setWordError] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showInGeneralSet, setShowInGeneralSet] = useState(true);

  useEffect(() => {
    if (!visible) return;
    setNewWord(initialWord ?? '');
    setNewTranslation(initialTranslation ?? '');
  }, [visible, initialWord, initialTranslation]);

  const wordSuggestions = useSuggestions(
    words.map(w => w.word),
    newWord
  );
  const translationSuggestions = useSuggestions(
    words.map(w => w.translation),
    newTranslation
  );

  const existingWord = useMemo(() => {
    const trimmed = newWord.trim().toLowerCase();
    if (!trimmed) return undefined;
    return words.find(w => w.word.toLowerCase() === trimmed);
  }, [words, newWord]);

  const handleAdd = async () => {
    const word = newWord.trim();
    const translation = newTranslation.trim();

    if (!word) {
      setWordError('Введите слово');
      return;
    }

    if (existingWord) {
      await editWord(
        existingWord.id,
        word,
        translation,
        existingWord.score ?? 0,
        {
          folderIds: selectedFolderId ? [selectedFolderId] : [],
          showInGeneralSet,
        }
      );
      closeModal();
      return;
    }

    await addWord(word, translation, {
      folderIds: selectedFolderId ? [selectedFolderId] : [],
      showInGeneralSet,
    });
    closeModal();
  };

  const closeModal = () => {
    setNewWord('');
    setNewTranslation('');
    setSelectedFolderId(null);
    setShowInGeneralSet(true);
    setWordError('');
    onClose();
  };

  return (
    <ModalWithKeyboard visible={visible} palette={palette} keyboardVerticalOffset={64}>
      <Text style={[modalStyles.title, { color: palette.slate900 }]}>
        Add new word
      </Text>
      <InputWithSuggestions
        value={newWord}
        onChangeText={setNewWord}
        placeholder="Английское слово"
        suggestions={wordSuggestions}
        onSelect={setNewWord}
        palette={palette}
        error={wordError}
        keyboardType="ascii-capable"
        autofocus
        compact
      />
      <InputWithSuggestions
        value={newTranslation}
        onChangeText={setNewTranslation}
        placeholder="Русский перевод"
        suggestions={translationSuggestions}
        onSelect={setNewTranslation}
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ color: palette.slate700 }}>Show in general set</Text>
        <Switch value={showInGeneralSet} onValueChange={setShowInGeneralSet} />
      </View>
      <View style={modalStyles.buttonsGroup}>
        <TouchableOpacity
          style={[
            modalStyles.iconButton,
            { backgroundColor: palette.white },
          ]}
          onPress={closeModal}
        >
          <IconClose size={MODAL_ICON_SIZE} color={palette.slate700} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            modalStyles.iconButton,
            { backgroundColor: palette.white },
          ]}
          onPress={handleAdd}
        >
          <IconCheck size={MODAL_ICON_SIZE} color={palette.slate700} />
        </TouchableOpacity>
      </View>
    </ModalWithKeyboard>
  );
}

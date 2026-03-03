import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { InputWithSuggestions } from '../InputWithSuggestions';
import { ModalWithKeyboard } from '../ModalWithKeyboard';
import { IconClose, IconCheck } from '../Icons';
import { useSuggestions } from '../../hooks/useSuggestions';
import { modalStyles } from '../../theme/modal.styles';
import type { WordPair } from '../../types/word';
import type { Palette } from '../../types/palette';

const MODAL_ICON_SIZE = 28;

export type AddWordModalProps = {
  words: WordPair[];
  visible: boolean;
  onClose: () => void;
  palette: Palette;
  addWord: (word: string, translation: string) => Promise<WordPair | void>;
  editWord: (
    id: string,
    word: string,
    translation: string,
    score?: number
  ) => Promise<void>;
};

export function AddWordModal({
  words,
  visible,
  onClose,
  palette,
  addWord,
  editWord,
}: AddWordModalProps) {
  const [newWord, setNewWord] = useState('');
  const [wordError, setWordError] = useState('');
  const [newTranslation, setNewTranslation] = useState('');

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
        existingWord.score ?? 0
      );
      closeModal();
      return;
    }

    await addWord(word, translation);
    closeModal();
  };

  const closeModal = () => {
    setNewWord('');
    setNewTranslation('');
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
      />
      <InputWithSuggestions
        value={newTranslation}
        onChangeText={setNewTranslation}
        placeholder="Русский перевод"
        suggestions={translationSuggestions}
        onSelect={setNewTranslation}
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
          onPress={onClose}
        >
          <IconClose size={MODAL_ICON_SIZE} color={palette.slate700} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            modalStyles.iconButton,
            {
              backgroundColor: palette.white,
              borderColor: palette.borderStrong,
            },
          ]}
          onPress={handleAdd}
        >
          <IconCheck size={MODAL_ICON_SIZE} color={palette.slate700} />
        </TouchableOpacity>
      </View>
    </ModalWithKeyboard>
  );
}

import { KeyboardAvoidingView, Modal, Platform, Text, TouchableOpacity, View } from "react-native"
import { InputWithSuggestions } from "../InputWithSuggestions"
import { styles } from './AddWordModal.styles'
import { useMemo, useState } from "react";
import { useSuggestions } from "../../hooks/useSuggestions";

export const AddWordModal = ({
  words,
  visible, 
  onClose, 
  palette, 
  addWord,
  editWord,
}: {
  words: any[];
  visible: boolean, 
  onClose: () => void, 
  palette: any,
  addWord: (word: string, translation: string) => Promise<any>;
  editWord: (
    id: string,
    word: string,
    translation: string,
    score: number
  ) => Promise<void>;
}) => {
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

    return words.find(
      w => w.word.toLowerCase() === trimmed
    );
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
    <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
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

              <View style={styles.modalButtonsGroup}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: palette.slate400 },
                  ]}
                  onPress={onClose} 
                >
                  <Text style={styles.buttonText}>Отмена</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: palette.blue },
                  ]}
                  onPress={handleAdd}
                >
                  <Text style={styles.buttonText}>Сохранить</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
  );
}
import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ModalWithKeyboard } from '../ModalWithKeyboard';
import { IconClose, IconCheck } from '../Icons';
import { modalStyles } from '../../theme/modal.styles';
import { checkSentence, type CheckResult } from '../../services/checkSentence';
import type { Palette } from '../../types/palette';

const MODAL_ICON_SIZE = 28;
const MIN_TEXTAREA_HEIGHT = 88;
const MAX_TEXTAREA_HEIGHT = 220;

function getSuggestionSegments(
  original: string,
  suggestion: string
): Array<{ text: string; bold: boolean }> {
  const origWords = original.trim().split(/\s+/);
  const suggWords = suggestion.trim().split(/\s+/);
  const segments: Array<{ text: string; bold: boolean }> = [];
  for (let i = 0; i < suggWords.length; i++) {
    const word = suggWords[i];
    const isChanged =
      i >= origWords.length || origWords[i].toLowerCase() !== word.toLowerCase();
    segments.push({
      text: (i > 0 ? ' ' : '') + word,
      bold: isChanged,
    });
  }
  return segments;
}

export type SentenceCheckModalProps = {
  visible: boolean;
  onClose: () => void;
  word: string;
  palette: Palette;
};

export function SentenceCheckModal({
  visible,
  onClose,
  word,
  palette,
}: SentenceCheckModalProps) {
  const [sentence, setSentence] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [lastCheckedSentence, setLastCheckedSentence] = useState('');
  const [inputHeight, setInputHeight] = useState(MIN_TEXTAREA_HEIGHT);

  const handleCheck = async () => {
    const trimmed = sentence.trim();
    if (!trimmed) return;
    setResult(null);
    setLoading(true);
    try {
      const res = await checkSentence(word, trimmed);
      setLastCheckedSentence(trimmed);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSentence('');
    setResult(null);
    setLastCheckedSentence('');
    setInputHeight(MIN_TEXTAREA_HEIGHT);
    onClose();
  };

  const trimmed = sentence.trim();
  const textChangedAfterCheck = result === null || trimmed !== lastCheckedSentence;
  const canSubmit = trimmed.length > 0 && !loading && textChangedAfterCheck;

  return (
    <ModalWithKeyboard
      visible={visible}
      palette={palette}
      keyboardVerticalOffset={64}
    >
      <Text
        style={[modalStyles.title, { color: palette.slate900 }]}
        numberOfLines={3}
      >
        A sentence with the word "{word}"
      </Text>

      <TextInput
        value={sentence}
        onChangeText={setSentence}
        placeholder="Enter the sentence in English..."
        placeholderTextColor={palette.slate400}
        editable={!loading}
        multiline
        autoCorrect={false}
        spellCheck={false}
        autoComplete="off"
        autoFocus
        textAlignVertical="top"
        onContentSizeChange={(e) => {
          const { height } = e.nativeEvent.contentSize;
          setInputHeight(
            Math.min(MAX_TEXTAREA_HEIGHT, Math.max(MIN_TEXTAREA_HEIGHT, height + 24))
          );
        }}
        style={[
          styles.textarea,
          {
            borderColor: palette.border,
            color: palette.slate900,
            backgroundColor: palette.white,
            height: inputHeight,
          },
        ]}
      />

      {result !== null && (
        <View style={styles.resultWrap}>
          {result.status === 'ok' && (
            <Text style={[styles.resultOk, { color: palette.greenDeep }]}>
              OK
            </Text>
          )}
          {result.status === 'corrected' && (
            <Text style={[styles.resultSuggestion, { color: palette.slate900 }]}>
              {getSuggestionSegments(lastCheckedSentence, result.message).map(
                (seg, i) =>
                  seg.bold ? (
                    <Text key={i} style={styles.resultSuggestionBold}>
                      {seg.text}
                    </Text>
                  ) : (
                    <Text key={i}>{seg.text}</Text>
                  )
              )}
            </Text>
          )}
          {result.status === 'error' && (
            <Text style={[styles.resultError, { color: palette.red }]}>
              {result.message}
            </Text>
          )}
        </View>
      )}

      <View style={modalStyles.buttonsGroup}>
        <TouchableOpacity
          style={[
            modalStyles.iconButton,
            { backgroundColor: palette.white },
          ]}
          onPress={handleClose}
        >
          <IconClose size={MODAL_ICON_SIZE} color={palette.slate700} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            modalStyles.iconButton,
            { backgroundColor: palette.white },
          ]}
          onPress={handleCheck}
          disabled={!canSubmit}
        >
          {loading ? (
            <ActivityIndicator size="small" color={palette.slate700} />
          ) : (
            <IconCheck size={MODAL_ICON_SIZE} color={palette.slate700} />
          )}
        </TouchableOpacity>
      </View>
    </ModalWithKeyboard>
  );
}

const styles = StyleSheet.create({
  textarea: {
    alignSelf: 'stretch',
    width: '100%',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: MIN_TEXTAREA_HEIGHT,
  },
  resultWrap: {
    alignSelf: 'stretch',
    minHeight: 24,
    paddingVertical: 4,
  },
  resultOk: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  resultSuggestion: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  resultSuggestionBold: {
    fontWeight: '700',
  },
  resultError: {
    fontSize: 14,
    textAlign: 'center',
  },
});

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  StyleSheet,
  KeyboardTypeOptions,
} from 'react-native';

import type { Palette } from '../types/palette';
import { inputFieldStyles } from '../theme/inputField.styles';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  suggestions: string[];
  onSelect: (text: string) => void;
  palette: Palette;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  autofocus?: boolean;
  /** Уменьшенные отступы для модалок */
  compact?: boolean;
};

export const InputWithSuggestions = ({
  value,
  onChangeText,
  placeholder,
  suggestions,
  onSelect,
  palette,
  error,
  keyboardType,
  autofocus = false,
  compact = false,
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const [_, setKeyboardHeight] = useState(0);
  const containerRef = useRef<View>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <View
      ref={containerRef}
      style={[
        { position: 'relative' },
        compact ? inputFieldStyles.inputWrapCompact : inputFieldStyles.inputWrapDefault,
      ]}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.slate400}
        style={[
          styles.input,
          compact && styles.inputCompact,
          {
            borderColor: error ? palette.red : palette.border,
            color: palette.slate900,
            backgroundColor: palette.white,
          },
        ]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType={keyboardType}
        autoFocus={autofocus}
      />

      {error && <Text style={[styles.errorText, { color: palette.red }]}>{error}</Text>}

      {isFocused && suggestions.length > 0 && (
        <View
          style={[
            styles.suggestionsContainer,
            compact && styles.suggestionsContainerCompact,
            {
              backgroundColor: palette.white,
              borderColor: palette.border,
              maxHeight: 160,
            },
          ]}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.suggestionItem}
                onPress={() => {
                  onSelect(item);
                  setIsFocused(false);
                  Keyboard.dismiss();
                }}
              >
                <Text style={{ color: palette.slate700 }}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 36,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputCompact: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 20,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  suggestionsContainerCompact: {
    top: 48,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
});
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

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  suggestions: string[];
  onSelect: (text: string) => void;
  palette: any;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  autofocus?: boolean;
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
  autofocus = false
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
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
    <View ref={containerRef} style={{ position: 'relative', marginBottom: 20 }}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.slate400}
        style={[
          styles.input,
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
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 10,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6, // Android shadow
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
});
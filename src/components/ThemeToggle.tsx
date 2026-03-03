import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { Palette } from '../types/palette';

type Props = {
  isDark: boolean;
  palette: Palette;
  onSelectLight: () => void;
  onSelectDark: () => void;
};

const toggleStyle = {
  flex: 1,
  borderRadius: 14,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

export function ThemeToggle({
  isDark,
  palette,
  onSelectLight,
  onSelectDark,
}: Props) {
  return (
    <View
      style={{
        height: 36,
        width: 108,
        borderRadius: 18,
        padding: 4,
        flexDirection: 'row',
        gap: 4,
        backgroundColor: palette.border,
      }}
    >
      <TouchableOpacity
        style={[toggleStyle, !isDark && { backgroundColor: palette.white }]}
        onPress={onSelectLight}
      >
        <Text
          style={{
            color: isDark ? palette.slate500 : palette.slate700,
            fontSize: 10,
            fontWeight: '600',
          }}
        >
          Light
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[toggleStyle, isDark && { backgroundColor: palette.white }]}
        onPress={onSelectDark}
      >
        <Text
          style={{
            color: isDark ? palette.slate700 : palette.slate500,
            fontSize: 10,
            fontWeight: '600',
          }}
        >
          Dark
        </Text>
      </TouchableOpacity>
    </View>
  );
}

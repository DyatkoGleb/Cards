import React from 'react';
import {
  Modal,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { modalStyles } from '../theme/modal.styles';
import type { Palette } from '../types/palette';

type Props = {
  visible: boolean;
  children: React.ReactNode;
  palette: Palette;
  /** Смещение для клавиатуры (iOS) */
  keyboardVerticalOffset?: number;
};

export function ModalWithKeyboard({
  visible,
  children,
  palette,
  keyboardVerticalOffset = 64,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? keyboardVerticalOffset : 0}
          style={{ width: '100%', alignItems: 'center' }}
        >
          <ScrollView
            style={{ width: '100%' }}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={modalStyles.scrollWrap}
            showsVerticalScrollIndicator={false}
          >
            <View style={[modalStyles.content, { backgroundColor: palette.white }]}>
              {children}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

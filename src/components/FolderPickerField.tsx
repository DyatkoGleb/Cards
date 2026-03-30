import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import type { Folder } from '../types/word';
import type { Palette } from '../types/palette';
import { inputFieldStyles } from '../theme/inputField.styles';

type Props = {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelect: (folderId: string | null) => void;
  palette: Palette;
  /** Меньше внутренние отступы как у compact-инпутов в модалках */
  compact?: boolean;
};

export function FolderPickerField({
  folders,
  selectedFolderId,
  onSelect,
  palette,
  compact = false,
}: Props) {
  const [open, setOpen] = useState(false);

  const label = useMemo(() => {
    if (!selectedFolderId) return 'Без папки';
    return folders.find(f => f.id === selectedFolderId)?.name ?? 'Без папки';
  }, [folders, selectedFolderId]);

  const triggerPad = compact
    ? inputFieldStyles.triggerCompact
    : inputFieldStyles.triggerDefault;

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={[
          inputFieldStyles.trigger,
          triggerPad,
          {
            borderColor: palette.border,
            backgroundColor: palette.white,
          },
        ]}
        accessibilityLabel="Choose folder"
        accessibilityRole="button"
      >
        <Text style={[inputFieldStyles.triggerText, { color: palette.slate700 }]}>
          {label}
        </Text>
        <Text style={{ color: palette.slate500, fontSize: 12 }}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={inputFieldStyles.overlay}
          onPress={() => setOpen(false)}
        >
          <Pressable
            onPress={() => {}}
            style={[
              inputFieldStyles.sheet,
              {
                backgroundColor: palette.white,
                borderColor: palette.border,
              },
            ]}
          >
            <ScrollView keyboardShouldPersistTaps="handled">
              <TouchableOpacity
                onPress={() => {
                  onSelect(null);
                  setOpen(false);
                }}
                style={[
                  inputFieldStyles.sheetRow,
                  {
                    borderBottomColor: palette.border,
                    backgroundColor: !selectedFolderId ? palette.blueSoft : palette.white,
                  },
                ]}
              >
                <Text style={{ color: palette.slate700 }}>Без папки</Text>
              </TouchableOpacity>
              {folders.map(folder => {
                const active = selectedFolderId === folder.id;
                return (
                  <TouchableOpacity
                    key={folder.id}
                    onPress={() => {
                      onSelect(folder.id);
                      setOpen(false);
                    }}
                    style={[
                      inputFieldStyles.sheetRow,
                      {
                        borderBottomColor: palette.border,
                        backgroundColor: active ? palette.blueSoft : palette.white,
                      },
                    ]}
                  >
                    <Text style={{ color: palette.slate700 }}>{folder.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

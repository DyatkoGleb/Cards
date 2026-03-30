import { StyleSheet } from 'react-native';

/** Общие размеры полей как у `InputWithSuggestions` (инпут и выпадашка папки). */
export const inputFieldStyles = StyleSheet.create({
  inputWrapDefault: {
    marginBottom: 10,
  },
  inputWrapCompact: {
    marginBottom: 6,
  },
  trigger: {
    borderWidth: 1,
    borderRadius: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerDefault: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 10,
  },
  triggerCompact: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 6,
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    maxHeight: '70%',
    borderRadius: 36,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sheetRow: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
});

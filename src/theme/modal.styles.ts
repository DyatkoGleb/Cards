import { StyleSheet } from 'react-native';
import { iconButtonStyles } from './iconButton.styles';

/** Общие стили для модалок (добавление/редактирование слова, и т.п.) */
export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    borderRadius: 28,
    padding: 28,
    width: '86%',
    maxWidth: 360,
    gap: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },

  buttonsGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 12,
  },

  iconButton: iconButtonStyles.iconButton,
});

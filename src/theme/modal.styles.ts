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
    paddingTop: 28,
    /** Как в компактной модалке Gemini: заметный зазор под рядом кнопок (у «длинных» модалок визуально съедался). */
    paddingBottom: 44,
    paddingHorizontal: 28,
    width: '86%',
    maxWidth: 360,
    alignSelf: 'center',
    maxHeight: '88%',
    gap: 8,
    alignItems: 'stretch',
  },
  scrollWrap: {
    width: '100%',
    minWidth: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    paddingVertical: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    flexShrink: 1,
  },

  buttonsGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    width: '100%',
    marginTop: 8,
    gap: 8,
  },

  /** Как под карточкой: 64×64, тень, без обводки — фон задаётся в экране (`palette.white`). */
  iconButton: {
    ...iconButtonStyles.iconButton,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
});

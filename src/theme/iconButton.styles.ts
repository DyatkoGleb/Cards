import { StyleSheet } from 'react-native';

/** Общий стиль круглой кнопки с иконкой (64×64). Используется под карточкой и в модалках. */
export const iconButtonStyles = StyleSheet.create({
  iconButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
});

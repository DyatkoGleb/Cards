import { TouchableOpacity } from 'react-native';
import { IconPlus } from './Icons';
import { iconButtonStyles } from '../theme/iconButton.styles';
import type { Palette } from '../types/palette';

type Props = {
  onPress: () => void;
  palette: Palette;
};

export const AddWordButton = ({ onPress, palette }: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        iconButtonStyles.iconButton,
        {
          backgroundColor: palette.white,
          marginTop: -20,
          elevation: 4,
        },
      ]}
    >
      <IconPlus size={28} color={palette.slate700} />
    </TouchableOpacity>
  );
};
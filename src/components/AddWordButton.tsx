import { Text, TouchableOpacity } from "react-native";

export const AddWordButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -20,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 32, lineHeight: 36 }}>
        +
      </Text>
    </TouchableOpacity>
  );
}
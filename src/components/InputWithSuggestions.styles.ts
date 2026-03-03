import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    suggestionsContainer: {
        position: 'absolute',
        top: 48,
        left: 0,
        right: 0,
    
        maxHeight: 160,
        borderWidth: 1,
        borderRadius: 10,
        zIndex: 1000,
    
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },

    suggestionItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
})
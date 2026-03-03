import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  content: {
    flex: 1,
  },

  contentInner: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },

  /* ---------- HEADER ---------- */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  h1: {
    fontSize: 28,
    fontWeight: '700',
  },

  toggle: {
    height: 36,
    width: 108,
    borderRadius: 18,
    padding: 4,
    flexDirection: 'row',
    gap: 4,
  },

  toggleLight: {
    flex: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  toggleDark: {
    flex: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ---------- CARD ---------- */
  bigCard: {
    backgroundColor: '#ff0000',
    width: '100%',
    height: 648,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  word: {
    fontSize: 42,
    fontWeight: '700',
    textAlign: 'center'
  },

  hint: {
    marginTop: 15,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },

  gradientOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  gradientFill: {
    flex: 1,
  },

  editBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  
  editBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
});
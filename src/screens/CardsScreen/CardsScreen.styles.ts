import { StyleSheet } from 'react-native';
import {
  PAGE_PADDING_HORIZONTAL,
  PAGE_PADDING_BOTTOM,
  HEADER_CONTENT_GAP,
} from '../../theme/layout';

export const styles = StyleSheet.create({
  content: {
    flex: 1,
  },

  contentInner: {
    paddingHorizontal: PAGE_PADDING_HORIZONTAL,
    paddingBottom: PAGE_PADDING_BOTTOM,
    gap: HEADER_CONTENT_GAP,
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

  setSelectorScroll: {
    maxHeight: 48,
  },

  setSelectorScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },

  setPill: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  /* ---------- CARD ---------- */
  bigCard: {
    backgroundColor: '#ff0000',
    width: '100%',
    flex: 1,
    minHeight: 320,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    gap: 10,
  },

  word: {
    fontSize: 42,
    fontWeight: '700',
    textAlign: 'center'
  },

  cardPressArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },

  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 15,
  },

  actionRow: {
    display: 'flex',
    flexDirection: 'row',
    paddingVertical: 16,
    gap: 20,
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
});

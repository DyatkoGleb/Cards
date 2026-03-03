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

  /* ---------- CARD ---------- */
  bigCard: {
    backgroundColor: '#ff0000',
    width: '100%',
    height: 648,
    borderRadius: 20,
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
});

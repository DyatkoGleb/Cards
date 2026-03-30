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

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  headerPillButton: {
    height: 36,
    minWidth: 72,
    paddingHorizontal: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerPillButtonText: {
    fontSize: 10,
    fontWeight: '600',
  },

  h1: { fontSize: 28, fontWeight: '700' },

  profileCard: {
    borderRadius: 20,
    padding: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignSelf: 'center',
  },

  name: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  note: { fontSize: 12, fontWeight: '600', textAlign: 'center' },

  statsRow: { flexDirection: 'row', gap: 8 },

  stat: {
    height: 70,
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  section: {
    borderRadius: 16,
    padding: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },

  sectionTitle: { fontSize: 16, fontWeight: '700' },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  tabsRow: {
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'stretch',
  },

  tabHalf: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
  },

  stickySearchWrap: {
    paddingVertical: 4,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  searchInput: {
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 18,
    marginBottom: 8,
  },

  searchInputFlex: {
    flex: 1,
    marginBottom: 0,
  },

  scrollTopBtn: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  geminiKeyInput: {
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 18,
  },

  row: {
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },

  rowText: { fontSize: 13, fontWeight: '500' },

  rowWordPair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },

  folderAddBtn: {
    width: 36,
    height: 36,
    borderWidth: 0,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  folderWordRow: {
    marginLeft: 12,
    marginBottom: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
});
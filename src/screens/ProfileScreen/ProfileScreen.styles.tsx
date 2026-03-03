import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  content: { flex: 1 },
  contentInner: { paddingHorizontal: 16, paddingBottom: 24, gap: 14 },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  
  headerButton: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  toggle: {
    width: 120,
    height: 36,
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

  h1: { fontSize: 28, fontWeight: '700' },

  profileCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 8,
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
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },

  sectionTitle: { fontSize: 16, fontWeight: '700' },

  searchInput: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 8,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    borderRadius: 20,
    padding: 30,
    width: '80%',
    gap: 15,
  },

  modalTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center' },

  modalButtonsRow: {
    gap: 10,
    marginTop: 10,
  },

  modalButtonsGroup: {
    flexDirection: 'row',
    gap: 10,
  },

  modalButton: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
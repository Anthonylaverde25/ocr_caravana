import { StyleSheet } from 'react-native';

export const colors = {
  background: '#F5F5F7',
  surface: '#FFFFFF',
  text: '#1C1C1E',
  muted: '#8E8E93',
  border: '#E5E5EA',
  // Verde Esmeralda (Emerald Palette)
  primary: '#059669',
  primaryDark: '#047857',
  primaryLight: '#10B981',
  primaryBg: '#ECFDF5',
  emeraldDeep: '#064E3B',
  emeraldBorder: '#A7F3D0',
  success: '#34C759',
  successBg: '#E8F5E9',
  warning: '#FF9500',
  warningBg: '#FFF3E0',
  danger: '#FF3B30',
  dangerBg: '#FDECEA',
  info: '#5856D6',
  infoBg: '#EEEDFB',
};

export const common = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12 },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, gap: 8 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted, textTransform: 'uppercase' },
  body: { fontSize: 15, color: colors.text },
  muted: { fontSize: 13, color: colors.muted },
  input: {
    backgroundColor: colors.background, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 16, color: colors.text,
  },
  button: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  buttonSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary },
  buttonSecondaryText: { color: colors.primary },
  buttonDisabled: { opacity: 0.4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: colors.background },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 14, color: colors.text },
  chipTextActive: { color: 'white', fontWeight: '600' },
});

/** 032000000100007 → "032 0000 0010 0007": grouped so it can be read aloud at the chute. */
export function formatEid(eid: string): string {
  return `${eid.slice(0, 3)} ${eid.slice(3, 7)} ${eid.slice(7, 11)} ${eid.slice(11)}`;
}

import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

/**
 * Forest-green palette (design refs: referencias_diseno/image.png, image2.png). A single neutral scale;
 * legacy keys (primaryBg, emeraldDeep…) are kept so screens not yet redesigned follow the new palette.
 */
export const colors = {
  background: '#F2F4F1',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F8F6',
  text: '#15201A',
  textSecondary: '#4B5563',
  muted: '#6B7280',
  subtle: '#9CA3AF',
  border: '#E5E7EB',
  borderSubtle: '#EEF0EC',

  primary: '#0E5C36',
  primaryDark: '#0A4A2B',
  primaryLight: '#2E8B57',
  primaryBg: '#E7F2EB',
  // Must match the native splash background in app.json (changing it needs a rebuild).
  emeraldDeep: '#064E3B',
  emeraldBorder: '#BFDCCB',
  // Text and controls laid on the green header.
  onPrimary: '#FFFFFF',
  onPrimaryMuted: 'rgba(255, 255, 255, 0.72)',
  onPrimaryGlass: 'rgba(255, 255, 255, 0.12)',
  onPrimaryGlassBorder: 'rgba(255, 255, 255, 0.18)',
  overlay: 'rgba(7, 20, 13, 0.55)',
  primaryScrim: 'rgba(14, 92, 54, 0.85)',
  // Camera and photo viewer: true black so the image is judged as it is.
  media: '#000000',
  mediaScrim: 'rgba(0, 0, 0, 0.5)',
  mediaDivider: '#262626',
  onMedia: 'rgba(255, 255, 255, 0.85)',
  onMediaBorder: 'rgba(255, 255, 255, 0.75)',

  success: '#16A34A',
  successBg: '#E8F5EC',
  warning: '#D97706',
  warningText: '#B45309',
  warningBg: '#FEF3C7',
  danger: '#DC2626',
  dangerBg: '#FDECEA',
  info: '#6D4AD6',
  infoBg: '#F1EDFC',
};

export const radius = { sm: 8, md: 12, lg: 20, xl: 28, pill: 999 };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };

export const fonts = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
};

/**
 * Custom families carry their own weight: on Android a fontWeight next to a custom fontFamily falls back
 * to the system font, so weight is chosen by family and never set alongside it.
 */
export const type = StyleSheet.create({
  display: { fontFamily: fonts.semibold, fontSize: 44, lineHeight: 50, color: colors.text },
  title: { fontFamily: fonts.semibold, fontSize: 22, color: colors.text },
  heading: { fontFamily: fonts.semibold, fontSize: 18, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  caption: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  label: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted },
}) satisfies Record<string, TextStyle>;

export const shadow = StyleSheet.create({
  card: {
    shadowColor: '#0B2A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  raised: {
    shadowColor: '#0B2A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
}) satisfies Record<string, ViewStyle>;

export const common = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, gap: 10, ...shadow.card },
  title: { fontFamily: fonts.semibold, fontSize: 22, color: colors.text },
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  body: { fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  muted: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  input: {
    backgroundColor: colors.surfaceMuted, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderSubtle,
    paddingHorizontal: 14, paddingVertical: 12, fontFamily: fonts.regular, fontSize: 16, color: colors.text,
  },
  button: {
    backgroundColor: colors.primary, borderRadius: radius.pill, minHeight: 52, paddingHorizontal: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  buttonText: { fontFamily: fonts.medium, color: colors.onPrimary, fontSize: 16 },
  buttonSecondary: { backgroundColor: colors.primaryBg },
  buttonSecondaryText: { color: colors.primary },
  buttonDisabled: { opacity: 0.4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary },
  chipTextActive: { color: colors.onPrimary },
});

/** 032000000100007 → "032 0000 0010 0007": grouped so it can be read aloud at the chute. */
export function formatEid(eid: string): string {
  return `${eid.slice(0, 3)} ${eid.slice(3, 7)} ${eid.slice(7, 11)} ${eid.slice(11)}`;
}

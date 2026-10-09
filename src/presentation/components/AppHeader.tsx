import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useReader } from '../reader/ReaderContext';
import { colors, fonts, radius } from '../reader/theme';
import { ErpLogo } from './ErpLogo';
import { IconButton } from './ui/IconButton';
import { ReaderStatusButton } from './ReaderStatusButton';

export interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onBack?: () => void;
  /** "Hola, Buen día" + date instead of the title (Home). */
  greeting?: boolean;
  /**
   * Square bottom edge: the screen continues the green with a HeaderBand under its first card.
   * Otherwise the header closes with rounded corners.
   */
  extended?: boolean;
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Built by hand: Intl support differs between Hermes builds.
function formatToday(now: Date): string {
  return `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}

function greetingFor(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return 'Buen día';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export function AppHeader({
  title = 'GANADERO',
  subtitle,
  rightElement,
  onBack,
  greeting = false,
  extended = false,
}: AppHeaderProps) {
  const { auth, signOut, online } = useReader();

  const companyName = subtitle || auth?.company?.name || 'Establecimiento Principal';
  const userName = auth?.userName || 'Operador';
  const userInitial = userName.charAt(0).toUpperCase();
  const now = new Date();

  const handleProfilePress = () => {
    Alert.alert(
      userName,
      `Establecimiento: ${companyName}\nEstado: ${online ? 'Conectado a internet' : 'Modo fuera de línea'}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: () => signOut() },
      ]
    );
  };

  const leading = greeting ? null : onBack ? (
    <IconButton icon={ArrowLeft} tone="glass" onPress={onBack} accessibilityLabel="Volver" />
  ) : (
    <View style={styles.logoBadge}>
      <ErpLogo size={22} color={colors.onPrimary} strokeWidth={3.2} />
    </View>
  );

  const trailing = rightElement ?? (
    <>
      {/* Always shown: the wand's link matters on every screen, not only while reading. */}
      <ReaderStatusButton />
      <TouchableOpacity
        style={styles.avatarButton}
        onPress={handleProfilePress}
        activeOpacity={0.8}
        accessibilityLabel="Perfil del operador"
      >
        <Text style={styles.avatarText}>{userInitial}</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.safeContainer, !extended && styles.rounded]}>
      <View style={[styles.header, greeting && styles.headerGreeting]}>
        {leading}

        <View style={styles.titleColumn}>
          {greeting ? (
            <>
              <Text style={styles.greetingText} numberOfLines={1}>
                Hola, <Text style={styles.greetingStrong}>{greetingFor(now)}</Text>
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {formatToday(now)} · {companyName}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {companyName}
              </Text>
            </>
          )}
        </View>

        <View style={styles.rightSection}>{trailing}</View>
      </View>
    </SafeAreaView>
  );
}

/** Green continuation under an `extended` header, so the first card can sit half on it (design ref image.png). */
export function HeaderBand({ height = 72 }: { height?: number }) {
  return <View style={[styles.band, { height }]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  safeContainer: { backgroundColor: colors.primary },
  rounded: {
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    paddingBottom: 6,
  },
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  headerGreeting: { paddingTop: 8, paddingBottom: 4 },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.onPrimaryGlass,
    borderWidth: 1,
    borderColor: colors.onPrimaryGlassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleColumn: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.semibold, fontSize: 18, color: colors.onPrimary, letterSpacing: 0.3 },
  greetingText: { fontFamily: fonts.regular, fontSize: 24, color: colors.onPrimary },
  greetingStrong: { fontFamily: fonts.semibold },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, color: colors.onPrimaryMuted },
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.onPrimaryGlassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.bold, fontSize: 16, color: colors.primary },
  band: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
});

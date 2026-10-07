import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { ErpLogo } from './ErpLogo';
import { colors } from '../reader/theme';

interface SplashViewProps {
  /** The session was restored (or there is none): the app can be shown. */
  ready: boolean;
  onFinish: () => void;
}

/** Long enough to read the brand, short enough not to make anyone wait. */
const MIN_VISIBLE_MS = 1200;
const FADE_MS = 350;

/**
 * What the app shows while it opens: the same brand as the native splash — the bull and RXNA on the
 * deep green, laid out where the splash image puts them — so the switch is not seen, then "Lector
 * de manga" while the session is restored. It fades out once the app is ready.
 */
export function SplashView({ ready, onFinish }: SplashViewProps) {
  const { width } = useWindowDimensions();
  const opacity = useRef(new Animated.Value(1)).current;
  const tagline = useRef(new Animated.Value(0)).current;
  const shownAt = useRef(Date.now()).current;

  useEffect(() => {
    Animated.timing(tagline, { toValue: 1, duration: 500, delay: 250, useNativeDriver: true }).start();
  }, [tagline]);

  useEffect(() => {
    if (!ready) return;

    const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt));
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver: true }).start(() => onFinish());
    }, wait);

    return () => clearTimeout(timer);
  }, [ready, opacity, shownAt, onFinish]);

  // The splash image is a square as wide as the screen: the bull takes 62% of it, the name below.
  const logo = Math.min(width, 520) * 0.62;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { opacity }]} pointerEvents={ready ? 'none' : 'auto'}>
      <ErpLogo size={logo} color={colors.surface} strokeWidth={3.4} />
      <Text style={styles.brand}>RXNA</Text>
      <Text style={styles.subtitle}>SISTEMA GANADERO</Text>
      <Animated.View style={[styles.tagline, { opacity: tagline }]}>
        <Text style={styles.taglineText}>Lector de manga</Text>
        <ActivityIndicator color={colors.emeraldBorder} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.emeraldDeep, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  brand: { color: colors.surface, fontSize: 44, fontWeight: '800', letterSpacing: 6, marginTop: 4 },
  subtitle: { color: colors.emeraldBorder, fontSize: 14, fontWeight: '700', letterSpacing: 4, marginTop: 2 },
  tagline: { position: 'absolute', bottom: 72, alignItems: 'center', gap: 10 },
  taglineText: { color: colors.emeraldBorder, fontSize: 14, fontWeight: '600' },
});

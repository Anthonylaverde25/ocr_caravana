import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors } from '../../reader/theme';

interface IconButtonProps {
  icon: LucideIcon;
  onPress?: () => void;
  accessibilityLabel: string;
  /** "glass" sits on the green header, "light" on white surfaces. */
  tone?: 'glass' | 'light';
  size?: number;
  /** Small red dot, e.g. for pending notifications. */
  badge?: boolean;
}

export function IconButton({ icon: Icon, onPress, accessibilityLabel, tone = 'light', size = 40, badge }: IconButtonProps) {
  const isGlass = tone === 'glass';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        isGlass ? styles.glass : styles.light,
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Icon size={size * 0.45} color={isGlass ? colors.onPrimary : colors.text} strokeWidth={2} />
      {badge && <View style={styles.badge} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  glass: { backgroundColor: colors.onPrimaryGlass, borderWidth: 1, borderColor: colors.onPrimaryGlassBorder },
  light: { backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.borderSubtle },
  badge: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
});

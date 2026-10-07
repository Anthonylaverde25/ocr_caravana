import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors, fonts, radius } from '../../reader/theme';

interface PillButtonProps {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'soft';
  disabled?: boolean;
  /** Shows a spinner in place of the label and blocks presses. */
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Full-width rounded CTA with an optional leading icon in a circle (design refs: "Add To Cart"). */
export function PillButton({ label, onPress, icon: Icon, variant = 'primary', disabled, loading, style }: PillButtonProps) {
  const isPrimary = variant === 'primary';
  const fg = isPrimary ? colors.onPrimary : colors.primary;

  return (
    <TouchableOpacity
      style={[styles.base, isPrimary ? styles.primary : styles.soft, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {Icon && (
            <View style={[styles.iconCircle, { borderColor: fg }]}>
              <Icon size={13} color={fg} strokeWidth={2.6} />
            </View>
          )}
          <Text style={[styles.label, { color: fg }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
  },
  primary: { backgroundColor: colors.primary },
  soft: { backgroundColor: colors.primaryBg },
  disabled: { opacity: 0.4 },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: fonts.medium, fontSize: 16 },
});

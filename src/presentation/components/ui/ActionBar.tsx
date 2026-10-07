import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius, shadow } from '../../reader/theme';

/** Bottom bar for a screen's main actions, kept within thumb reach. */
export function ActionBar({ children }: { children: React.ReactNode }) {
  return <View style={styles.bar}>{children}</View>;
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 10,
    ...shadow.raised,
  },
});

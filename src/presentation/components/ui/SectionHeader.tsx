import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts } from '../../reader/theme';

interface SectionHeaderProps {
  title: string;
  /** Secondary line under the title (e.g. last update time). */
  meta?: React.ReactNode;
  /** Without onAction a custom label is shown as plain info text (e.g. a count). */
  actionLabel?: string;
  onAction?: () => void;
}

const DEFAULT_ACTION = 'Ver todo';

export function SectionHeader({ title, meta, actionLabel = DEFAULT_ACTION, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.titleColumn}>
        <Text style={styles.title}>{title}</Text>
        {meta}
      </View>
      {onAction ? (
        <TouchableOpacity onPress={onAction} hitSlop={8} accessibilityRole="button">
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : (
        actionLabel !== DEFAULT_ACTION && <Text style={styles.info}>{actionLabel}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  titleColumn: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.semibold, fontSize: 18, color: colors.text },
  action: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary },
  info: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
});

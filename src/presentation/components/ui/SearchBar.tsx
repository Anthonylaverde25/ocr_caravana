import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { colors, fonts, radius } from '../../reader/theme';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

/** Glass search field laid on the green header (design ref image.png). */
export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <View style={styles.bar}>
      <Search size={18} color={colors.onPrimaryMuted} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.onPrimaryMuted}
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChange('')} hitSlop={8} accessibilityLabel="Limpiar búsqueda">
          <X size={16} color={colors.onPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 50,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.onPrimaryGlass,
    borderWidth: 1,
    borderColor: colors.onPrimaryGlassBorder,
  },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.onPrimary, padding: 0 },
});

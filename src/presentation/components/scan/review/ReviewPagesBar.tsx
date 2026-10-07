import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import { colors, fonts, radius } from '../../../reader/theme';
import type { SheetPage } from '../../../../core/work-templates/sheet/types';

interface ReviewPagesBarProps {
  pages: SheetPage[];
  missingPages: number[];
  multiPage: boolean;
  busy: boolean;
  locked: boolean;
  pageError: string | null;
  onAddFromCamera: () => void;
  onAddFromGallery: () => void;
}

/**
 * The pages of the document loaded so far, the ones it announces but are missing, and how to add
 * another one. It can be registered with pages missing: what they list simply was not loaded.
 */
export function ReviewPagesBar({ pages, missingPages, multiPage, busy, locked, pageError, onAddFromCamera, onAddFromGallery }: ReviewPagesBarProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.chips}>
        {pages.map((page, i) => (
          <Text key={page.key} style={[styles.chip, styles.chipOk]}>
            Hoja {page.hojaNumero ?? i + 1} ✓ · {page.rows.length}
          </Text>
        ))}
        {missingPages.map((n) => (
          <Text key={`m-${n}`} style={[styles.chip, styles.chipMissing]}>
            Hoja {n} falta
          </Text>
        ))}
      </View>
      {multiPage && !locked && (
        <View style={styles.actions}>
          {busy ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <TouchableOpacity style={styles.button} onPress={onAddFromCamera}>
                <Camera size={15} color={colors.primaryDark} />
                <Text style={styles.buttonText}>Agregar hoja</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={onAddFromGallery}>
                <ImageIcon size={15} color={colors.primaryDark} />
                <Text style={styles.buttonText}>Desde galería</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
      {missingPages.length > 0 && (
        <Text style={styles.note}>Faltan hojas: se puede registrar igual. Lo que figura en ellas no se carga.</Text>
      )}
      {pageError ? <Text style={styles.error}>{pageError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { fontSize: 12, fontFamily: fonts.semibold, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm, overflow: 'hidden' },
  chipOk: { color: colors.primaryDark, backgroundColor: colors.primaryBg },
  chipMissing: { color: colors.warningText, backgroundColor: colors.warningBg },
  actions: { flexDirection: 'row', gap: 8 },
  button: { flexDirection: 'row', gap: 6, alignItems: 'center', borderWidth: 1, borderColor: colors.emeraldBorder, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 7 },
  buttonText: { fontSize: 13, fontFamily: fonts.medium, color: colors.primaryDark },
  note: { fontFamily: fonts.regular, fontSize: 12, color: colors.warningText },
  error: { fontFamily: fonts.regular, fontSize: 12, color: colors.danger },
});

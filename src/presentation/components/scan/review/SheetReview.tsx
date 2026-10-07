import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { RotateCcw, WifiOff } from 'lucide-react-native';
import { colors, fonts, radius } from '../../../reader/theme';
import { errorCount } from '../../../../core/work-templates/sheet/feedback';
import type { SheetModule, SheetRow } from '../../../../core/work-templates/sheet/types';
import type { SheetReview as SheetReviewState } from '../../../scan/useSheetReview';
import { ReviewConfirmBar } from './ReviewConfirmBar';
import { ReviewHeaderCard } from './ReviewHeaderCard';
import { ReviewIssueList } from './ReviewIssueList';
import { ReviewPagesBar } from './ReviewPagesBar';
import { ReviewResultModal } from './ReviewResultModal';
import { ReviewRowCard } from './ReviewRowCard';
import { ReviewRowEditModal } from './ReviewRowEditModal';

interface SheetReviewProps {
  module: SheetModule;
  review: SheetReviewState;
  addingPage: boolean;
  pageError: string | null;
  onAddPageFromCamera: () => void;
  onAddPageFromGallery: () => void;
  onDiscard: () => void;
}

/**
 * The review of a scanned sheet of any template with a module: what was read, editable, and what
 * the server's rules say about it before anything is saved (a dry run after every change). A
 * person supervises it all and registers it.
 */
export function SheetReview({ module, review, addingPage, pageError, onAddPageFromCamera, onAddPageFromGallery, onDiscard }: SheetReviewProps) {
  const [editing, setEditing] = useState<SheetRow | null>(null);
  const feedback = review.feedback;
  const locked = review.saved !== null;
  const sheetIssues = {
    errors: (feedback?.headerErrors ?? []).filter((e) => !e.field || !module.headerFields.some((f) => f.key === e.field)),
    warnings: feedback?.headerWarnings ?? [],
  };

  const register = () => {
    if (review.canRegister) {
      review.register();
      return;
    }

    // Told on tap, not by a silently disabled button.
    Alert.alert(
      'Todavía no se puede registrar',
      review.validating || !review.current
        ? 'Esperá a que termine la validación con el sistema.'
        : feedback && errorCount(feedback) > 0
          ? 'Corregí los errores marcados en rojo.'
          : 'No hay renglones para registrar.'
    );
  };

  return (
    <View style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}>
          <Text style={styles.hint}>Revisá lo leído: el sistema valida cada cambio antes de registrar.</Text>
          {!locked && (
            <TouchableOpacity onPress={onDiscard} style={styles.discard} hitSlop={8}>
              <RotateCcw size={14} color={colors.muted} />
              <Text style={styles.discardText}>Otra planilla</Text>
            </TouchableOpacity>
          )}
        </View>

        <ReviewHeaderCard module={module} header={review.header} errors={feedback?.headerErrors ?? []} locked={locked} onChange={review.updateHeader} />

        {review.networkError ? (
          <TouchableOpacity style={styles.network} onPress={review.check}>
            <WifiOff size={14} color={colors.danger} />
            <Text style={styles.networkText}>{review.networkError}. Tocá para reintentar.</Text>
          </TouchableOpacity>
        ) : null}

        <ReviewIssueList errors={sheetIssues.errors} warnings={sheetIssues.warnings} />

        <ReviewPagesBar
          pages={review.pages}
          missingPages={review.missingPages}
          multiPage={module.multiPage}
          busy={addingPage}
          locked={locked}
          pageError={pageError}
          onAddFromCamera={onAddPageFromCamera}
          onAddFromGallery={onAddPageFromGallery}
        />

        <Text style={styles.section}>Renglones ({review.rows.length})</Text>
        {review.rows.map((row, index) => (
          <ReviewRowCard
            key={row.id}
            module={module}
            row={row}
            index={index}
            issues={review.issuesById[row.id]}
            skipped={!module.isWritten(row.values)}
            locked={locked}
            onEdit={() => setEditing(row)}
            onDelete={() => review.deleteRow(row.id)}
          />
        ))}
      </ScrollView>

      {!locked && (
        <ReviewConfirmBar
          sentCount={review.sentCount}
          errorCount={feedback && review.current ? errorCount(feedback) : 0}
          validating={review.validating}
          current={review.current}
          saving={review.saving}
          canRegister={review.canRegister}
          onAddRow={() => setEditing(review.newRow())}
          onRegister={register}
        />
      )}

      <ReviewRowEditModal module={module} row={editing} onSave={review.saveRow} onClose={() => setEditing(null)} />
      <ReviewResultModal module={module} saved={review.saved} onScanAnother={onDiscard} onClose={onDiscard} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hint: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  discard: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  discardText: { fontSize: 12, color: colors.muted, fontFamily: fonts.medium },
  network: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: colors.dangerBg, padding: 10, borderRadius: radius.md },
  networkText: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: colors.danger },
  section: { fontSize: 16, fontFamily: fonts.semibold, color: colors.text, marginTop: 4 },
});

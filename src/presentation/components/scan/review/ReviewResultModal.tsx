import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { colors } from '../../../reader/theme';
import type { ReviewFeedback } from '../../../../core/work-templates/sheet/feedback';
import type { SheetModule } from '../../../../core/work-templates/sheet/types';
import { ReviewIssueList } from './ReviewIssueList';

interface ReviewResultModalProps {
  module: SheetModule;
  saved: ReviewFeedback | null;
  onScanAnother: () => void;
  onClose: () => void;
}

/** The sheet went through: what the server registered, and the warnings it left to check. */
export function ReviewResultModal({ module, saved, onScanAnother, onClose }: ReviewResultModalProps) {
  if (!saved) return null;

  const lines = module.summarize(saved.data);
  const rowWarnings = Object.values(saved.rowWarnings).flat();

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <CheckCircle2 size={40} color={colors.primary} />
          <Text style={styles.title}>{module.code} registrada</Text>
          {saved.message ? <Text style={styles.message}>{saved.message}</Text> : null}
          {lines.map((line) => (
            <Text key={line} style={styles.line}>
              • {line}
            </Text>
          ))}
          <ReviewIssueList errors={[]} warnings={[...saved.headerWarnings, ...rowWarnings]} compact />
          <TouchableOpacity style={styles.primary} onPress={onScanAnother}>
            <Text style={styles.primaryText}>Escanear otra planilla</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.secondary}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, gap: 10, alignItems: 'stretch' },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center' },
  message: { fontSize: 14, color: colors.text, textAlign: 'center' },
  line: { fontSize: 14, color: colors.text },
  primary: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 6 },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  secondary: { textAlign: 'center', color: colors.primaryDark, fontWeight: '600', paddingVertical: 6 },
});

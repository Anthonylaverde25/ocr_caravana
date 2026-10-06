import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { X, Sparkles, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react-native';
import { colors } from '../../reader/theme';
import {
  AVAILABLE_SIMULATIONS,
  getSimulationPreset,
} from '../../../core/work-templates/simulationPresets';
import { SimulationPreset, WorkTemplateCode, ScanSimulationScenario } from '../../../core/work-templates/types';
import type { SheetPreset } from '../../../core/work-templates/sheet/presets';
import { SHEET_MODULES } from '../../../core/work-templates/registry';
import { SheetPresetList } from './SheetPresetList';

interface ScanSimulationModalProps {
  visible: boolean;
  onSelectPreset: (preset: SimulationPreset) => void;
  /** A test sheet of a template with a module: reviewed and validated like a photo. */
  onSelectSheetPreset: (preset: SheetPreset) => void;
  onClose: () => void;
}

/** Templates reviewed by module: their test sheets are listed above, so their old presets are not offered. */
const SHEET_PRESET_CODES = new Set(Object.keys(SHEET_MODULES));

export function ScanSimulationModal({
  visible,
  onSelectPreset,
  onSelectSheetPreset,
  onClose,
}: ScanSimulationModalProps) {
  const handleSelect = (code: WorkTemplateCode, scenario: ScanSimulationScenario) => {
    const preset = getSimulationPreset(code, scenario);
    onSelectPreset(preset);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <Sparkles size={20} color="#7C3AED" />
            <Text style={styles.title}>Simulación de Planillas</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={styles.instructions}>
          Elegí un preset de prueba para ensayar la digitalización y el alta sin necesidad de una planilla de papel.
        </Text>

        <ScrollView contentContainerStyle={styles.list}>
          <SheetPresetList
            onSelect={(preset) => {
              onSelectSheetPreset(preset);
              onClose();
            }}
          />
          {AVAILABLE_SIMULATIONS.filter((item) => !SHEET_PRESET_CODES.has(item.code)).map((item) => {
            const isWarning = item.scenario === 'WARNING_FLOW';
            return (
              <TouchableOpacity
                key={`${item.code}_${item.scenario}`}
                style={styles.card}
                onPress={() => handleSelect(item.code, item.scenario)}
                activeOpacity={0.7}
              >
                <View style={styles.cardLeft}>
                  <View style={styles.codeRow}>
                    <View style={styles.codeBadge}>
                      <Text style={styles.codeBadgeText}>{item.code}</Text>
                    </View>
                    <View
                      style={[
                        styles.scenarioBadge,
                        isWarning ? styles.scenarioWarning : styles.scenarioHappy,
                      ]}
                    >
                      {isWarning ? (
                        <AlertTriangle size={11} color="#B45309" />
                      ) : (
                        <CheckCircle size={11} color="#047857" />
                      )}
                      <Text
                        style={[
                          styles.scenarioText,
                          isWarning ? styles.scenarioTextWarning : styles.scenarioTextHappy,
                        ]}
                      >
                        {isWarning ? 'Con Alertas' : 'Flujo Estándar'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDescription}>{item.label}</Text>
                </View>

                <ChevronRight size={20} color={colors.muted} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  instructions: {
    fontSize: 13,
    color: colors.muted,
    paddingHorizontal: 20,
    paddingVertical: 12,
    lineHeight: 18,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardLeft: {
    flex: 1,
    gap: 6,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  scenarioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  scenarioHappy: {
    backgroundColor: '#ECFDF5',
  },
  scenarioWarning: {
    backgroundColor: '#FEF3C7',
  },
  scenarioText: {
    fontSize: 10,
    fontWeight: '700',
  },
  scenarioTextHappy: {
    color: '#047857',
  },
  scenarioTextWarning: {
    color: '#B45309',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  cardDescription: {
    fontSize: 12,
    color: colors.muted,
  },
});

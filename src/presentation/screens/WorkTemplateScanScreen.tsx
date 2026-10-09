import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader, HeaderBand } from '../components/AppHeader';
import { SectionHeader } from '../components/ui/SectionHeader';
import { colors, fonts } from '../reader/theme';
import {
  WorkTemplateCode,
  WorkTemplateContext,
  WorkTemplateScanRow,
  SimulationPreset,
} from '../../core/work-templates/types';
import { WorkTemplateApi } from '../../infrastructure/api/WorkTemplateApi';
import { ImagePickerService } from '../../infrastructure/camera/ImagePickerService';
import { ScanHeroCard } from '../components/scan/ScanHeroCard';
import { ScanImagePreview } from '../components/scan/ScanImagePreview';
import { ScanHeaderContextCard } from '../components/scan/ScanHeaderContextCard';
import { ScanRowItem } from '../components/scan/ScanRowItem';
import { ScanRowEditModal } from '../components/scan/ScanRowEditModal';
import { ScanSimulationModal } from '../components/scan/ScanSimulationModal';
import { ScanSuccessModal } from '../components/scan/ScanSuccessModal';
import { ScanSummaryBar } from '../components/scan/ScanSummaryBar';
import { ScanCameraModal } from '../components/scan/ScanCameraModal';
import { SheetReview } from '../components/scan/review/SheetReview';
import type { SheetPreset } from '../../core/work-templates/sheet/presets';
import { PickedSheetImage, useSheetScan } from '../scan/useSheetScan';

/** Whether a picked image starts a new sheet or is another page of the one under review. */
type CaptureTarget = 'new' | 'page';

export function WorkTemplateScanScreen() {
  const navigation = useNavigation<any>();

  // State
  const [templateCode, setTemplateCode] = useState<WorkTemplateCode>('ING-01');
  const [templateTitle, setTemplateTitle] = useState('Ingreso de Compra Directa');
  const [category, setCategory] = useState('ENTRY');
  const [context, setContext] = useState<WorkTemplateContext>({});
  const [rows, setRows] = useState<WorkTemplateScanRow[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');

  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [simulationModalVisible, setSimulationModalVisible] = useState(false);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [editingRow, setEditingRow] = useState<WorkTemplateScanRow | null>(null);
  const [isRowEditModalVisible, setIsRowEditModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [persistedCount, setPersistedCount] = useState(0);

  // Templates with a module (PAR-01…) are reviewed and validated by the server's rules.
  const sheet = useSheetScan();
  const captureTarget = useRef<CaptureTarget>('new');

  const route = (image: PickedSheetImage, target: CaptureTarget) => {
    if (target === 'page') sheet.addPage(image);
    else processUploadedImage(image.uri, image.name, image.mimeType);
  };

  // Take photo directly with camera (opens system camera if compiled or in-app viewfinder)
  const handleTakePhoto = async (target: CaptureTarget = 'new') => {
    const systemPhoto = await ImagePickerService.takePhotoWithPicker();
    if (systemPhoto) {
      route(systemPhoto, target);
      return;
    }
    captureTarget.current = target;
    setCameraModalVisible(true);
  };

  // Pick image from device gallery
  const handlePickGallery = async (target: CaptureTarget = 'new') => {
    try {
      const result = await ImagePickerService.pickFromGallery();
      if (result) {
        route(result, target);
      }
    } catch (err: any) {
      Alert.alert('Galería de Fotos', err.message || 'No se pudo acceder a la galería.');
      setErrorMessage(err.message);
    }
  };

  // A test sheet of a template with a module: the same review as a photo.
  const handleSelectSheetPreset = (preset: SheetPreset) => {
    setErrorMessage(null);
    setRows([]);
    sheet.open(preset.response, preset.fileName);
  };

  // Process image with backend AI identify endpoint
  const processUploadedImage = async (uri: string, name: string, mimeType: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setImageUri(uri);
    setImageName(name);

    try {
      const raw = await WorkTemplateApi.identifyRaw(uri, name, mimeType);

      if (sheet.open(raw, name)) {
        setRows([]);
        return;
      }

      const result = WorkTemplateApi.toScanResult(raw, uri, name);
      setTemplateCode(result.templateCode);
      setTemplateTitle(result.templateTitle);
      setCategory(result.category);
      setContext(result.context);
      setRows(result.rows);
    } catch (err: any) {
      setErrorMessage(err.message || 'No se pudo identificar la planilla.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Apply a test simulation preset
  const handleSelectSimulation = (preset: SimulationPreset) => {
    setErrorMessage(null);
    setTemplateCode(preset.code);
    setTemplateTitle(preset.title);
    setCategory('SIMULACIÓN');
    setContext(preset.context);
    setRows(preset.rows);
    setImageUri(null);
    setImageName(`simulacion_${preset.code}.png`);
  };

  // Row management
  const handleAddRow = () => {
    setEditingRow(null);
    setIsRowEditModalVisible(true);
  };

  const handleEditRow = (row: WorkTemplateScanRow) => {
    setEditingRow(row);
    setIsRowEditModalVisible(true);
  };

  const handleSaveRow = (savedRow: WorkTemplateScanRow) => {
    if (editingRow) {
      setRows((prev) => prev.map((r) => (r.id === savedRow.id ? savedRow : r)));
    } else {
      setRows((prev) => [savedRow, ...prev]);
    }
  };

  const handleDeleteRow = (index: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Persist session to backend API
  const handleSaveSession = async () => {
    if (rows.length === 0) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await WorkTemplateApi.processTemplate(templateCode, context, rows);
      setPersistedCount(rows.length);
      setSuccessModalVisible(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al persistir la sesión.');
      Alert.alert('Error al Guardar', err.message || 'No se pudo completar el alta en el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleScanAnother = () => {
    setSuccessModalVisible(false);
    setImageUri(null);
    setImageName('');
    setRows([]);
    setContext({});
    setErrorMessage(null);
  };

  const handleGoToOperations = () => {
    setSuccessModalVisible(false);
    navigation.navigate('Operaciones');
  };

  const cameraModal = (
    <ScanCameraModal
      visible={cameraModalVisible}
      onCapture={(res) => route(res, captureTarget.current)}
      onClose={() => setCameraModalVisible(false)}
    />
  );

  if (sheet.module) {
    return (
      <View style={styles.screenWrapper}>
        <AppHeader title="Planillas" subtitle={`${sheet.module.code} · ${sheet.module.title}`} />
        <SheetReview
          module={sheet.module}
          review={sheet.review}
          addingPage={sheet.addingPage}
          pageError={sheet.pageError}
          onAddPageFromCamera={() => handleTakePhoto('page')}
          onAddPageFromGallery={() => handlePickGallery('page')}
          onDiscard={() => {
            sheet.close();
            setImageUri(null);
            setImageName('');
          }}
        />
        {cameraModal}
      </View>
    );
  }

  return (
    <View style={styles.screenWrapper}>
      <AppHeader title="Planillas" subtitle="Escáner de planillas de campo con IA" extended />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <HeaderBand />
        {/* Hero Card with Camera / Gallery / Simulation options */}
        <ScanHeroCard
          isProcessing={isProcessing}
          onTakePhoto={() => handleTakePhoto('new')}
          onPickGallery={() => handlePickGallery('new')}
          onOpenSimulation={() => setSimulationModalVisible(true)}
          errorMessage={errorMessage}
        />

        {/* Captured image preview */}
        {imageUri && (
          <ScanImagePreview
            imageUri={imageUri}
            imageName={imageName}
            onRetake={() => handleTakePhoto('new')}
          />
        )}

        {/* Scanned metadata context */}
        {rows.length > 0 && (
          <ScanHeaderContextCard
            templateCode={templateCode}
            templateTitle={templateTitle}
            category={category}
            context={context}
            onContextChange={setContext}
          />
        )}

        {/* Extracted animals list */}
        {rows.length > 0 && (
          <View style={styles.rowsSection}>
            <SectionHeader
              title={`Animales detectados (${rows.length})`}
              meta={<Text style={styles.sectionHint}>Tocá una fila para editar la caravana o los datos.</Text>}
            />

            <View style={styles.rowsList}>
              {rows.map((row, index) => (
                <ScanRowItem
                  key={row.id}
                  row={row}
                  index={index}
                  onEdit={() => handleEditRow(row)}
                  onDelete={() => handleDeleteRow(index)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Summary & Save Bar */}
      {rows.length > 0 && (
        <ScanSummaryBar
          totalRows={rows.length}
          isSaving={isSaving}
          onAddRow={handleAddRow}
          onSave={handleSaveSession}
        />
      )}

      {/* Row Edit Modal */}
      <ScanRowEditModal
        visible={isRowEditModalVisible}
        row={editingRow}
        templateCode={templateCode}
        onSave={handleSaveRow}
        onClose={() => setIsRowEditModalVisible(false)}
      />

      {/* Simulation Selector Modal */}
      <ScanSimulationModal
        visible={simulationModalVisible}
        onSelectPreset={handleSelectSimulation}
        onSelectSheetPreset={handleSelectSheetPreset}
        onClose={() => setSimulationModalVisible(false)}
      />

      {/* Success Dialog Modal */}
      <ScanSuccessModal
        visible={successModalVisible}
        templateCode={templateCode}
        templateTitle={templateTitle}
        persistedCount={persistedCount}
        batchName={context.batch_name || context.lote}
        onScanAnother={handleScanAnother}
        onGoToOperations={handleGoToOperations}
      />

      {/* In-App Native Camera Viewfinder Modal */}
      {cameraModal}
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 20,
    paddingBottom: 28,
  },
  rowsSection: {
    gap: 10,
  },
  sectionHint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
  },
  rowsList: {
    gap: 10,
  },
});

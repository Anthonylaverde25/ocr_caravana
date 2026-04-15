import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Alert,
  Vibration,
  TextInput,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
} from "react-native-vision-camera";
import { scanOCR } from "@milvoj/vision-camera-ocr";
import { runOnJS, useSharedValue } from "react-native-reanimated";
import { useCameraPermissions } from "../hooks/useCameraPermissions";
import { LocalRepo } from "../../infrastructure/storage/LocalRepo";
import { SyncService } from "../../infrastructure/api/SyncService";
import { Caravana } from "../../core/entities/Caravana";
import { styles } from "./ScannerScreen.styles";

export const ScannerScreen = () => {
  const device = useCameraDevice("back");
  const hasPermission = useCameraPermissions();

  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Lógica de estabilidad (SharedValues para alta velocidad)
  const lastFound = useSharedValue<string>("");
  const stableCount = useSharedValue<number>(0);

  // Estados para el flujo de revisión
  const [detectedValue, setDetectedValue] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  // Función para manejar el hallazgo una vez estabilizado
  const onStabilityReached = runOnJS((text: string) => {
    setDetectedValue(text);
    setIsReviewing(true);
    Vibration.vibrate(100);
    console.log("🎯 [IA] DETECCIÓN ESTABLE CONFIRMADA:", text);

    // Reseteamos contadores para la próxima
    stableCount.value = 0;
    lastFound.value = "";
  });

  // Frame Processor - SIEMPRE ACTIVO Y FIJO
  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";

      // Si ya estamos revisando uno, no seguimos procesando para ahorrar recursos
      if (isReviewing) return;

      try {
        const data = scanOCR(frame);
        if (data && (data as any).result) {
          const blocks = (data as any).result.blocks || [];
          for (const block of blocks) {
            const text = block.text || "";
            const match = text.match(/\d{10,15}/); // Filtramos números de 10 a 15 dígitos para mayor precisión

            if (match) {
              const currentMatch = match[0];

              // Lógica de estabilidad: debe coincidir durante X cuadros
              if (currentMatch === lastFound.value) {
                stableCount.value += 1;
                if (stableCount.value >= 2) {
                  // 2 veces más el original (3 frames seguidos)
                  onStabilityReached(currentMatch);
                  return;
                }
              } else {
                lastFound.value = currentMatch;
                stableCount.value = 0;
              }

              // Log en terminal para que el usuario sepa que la IA está viva
              console.log(
                "🔍 [IA] Viendo:",
                currentMatch,
                `(Estabilidad: ${stableCount.value})`,
              );
            }
          }
        }
      } catch (e) {}
    },
    [isReviewing],
  );

  const confirmSave = () => {
    if (!detectedValue) return;

    const nuevaCaravana = new Caravana(detectedValue, "BOVINO", new Date());
    LocalRepo.save(nuevaCaravana);
    setLastScanned(detectedValue);
    setIsReviewing(false);
    setDetectedValue(null);

    console.log("✅ [MMKV] GUARDADO EN HISTORIAL:", detectedValue);
    Vibration.vibrate([0, 50, 50, 50]);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await SyncService.syncPending();
    setIsSyncing(false);
    Alert.alert("Sincronización", "Datos enviados al servidor.");
  };

  if (hasPermission === null)
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  if (hasPermission === false)
    return (
      <View style={styles.container}>
        <Text>Sin permiso de cámara</Text>
      </View>
    );
  if (!device)
    return (
      <View style={styles.container}>
        <Text>Cámara no encontrada</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Camera
        style={styles.cameraPreview}
        device={device}
        isActive={!isReviewing}
        frameProcessor={frameProcessor}
      />

      {/* Overlay de Guía Constante */}
      {!isReviewing && (
        <View style={styles.overlay}>
          <View style={styles.focusFrame} />
          <Text style={styles.instruction}>
            Observación Fija: Mantén el número en el recuadro
          </Text>
        </View>
      )}

      {/* PANEL DE CONFIRMACIÓN */}
      {isReviewing && (
        <View style={styles.reviewOverlay}>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewLabel}>CONFIRMAR NÚMERO</Text>
            <TextInput
              style={styles.reviewInput}
              value={detectedValue || ""}
              onChangeText={setDetectedValue}
              keyboardType="numeric"
            />

            <View style={styles.reviewActionGroup}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => setIsReviewing(false)}
              >
                <Text style={styles.retryText}>DESCARTAR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmSave}
              >
                <Text style={styles.confirmText}>GUARDAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* UI Inferior */}
      {!isReviewing && (
        <View style={styles.bottomBar}>
          <Text style={styles.status}>
            Último guardado: {lastScanned || "---"}
          </Text>
          <TouchableOpacity
            style={[styles.syncButton, isSyncing && styles.buttonDisabled]}
            onPress={handleSync}
            disabled={isSyncing}
          >
            <Text style={styles.syncText}>SINCRONIZAR AHORA</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

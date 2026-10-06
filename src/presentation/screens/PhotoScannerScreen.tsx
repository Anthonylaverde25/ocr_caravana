import React, { useRef, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Alert,
  Vibration,
  TextInput,
  ActivityIndicator,
  ScrollView
} from "react-native";
import {
  Camera,
  useCameraDevice,
} from "react-native-vision-camera";
import TextRecognition from "@react-native-ml-kit/text-recognition";
// IMPORTANTE: Ajusta estas rutas a la estructura real de tu proyecto
import { useCameraPermissions } from "../hooks/useCameraPermissions";
import { LocalRepo } from "../../infrastructure/storage/LocalRepo";
import { Caravana } from "../../core/entities/Caravana";
import { styles } from "./PhotoScannerScreen.styles";

export const PhotoScannerScreen = () => {
  // Configuración de la cámara
  const device = useCameraDevice("back");
  const hasPermission = useCameraPermissions();
  const cameraRef = useRef<Camera>(null);

  // Estados de la UI
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedValue, setDetectedValue] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [allResults, setAllResults] = useState<{raw: string, clean: string}[]>([]);

  const takePhotoAndScan = async () => {
    if (!cameraRef.current) return;

    try {
      setIsProcessing(true);
      Vibration.vibrate(50); // Feedback de captura

      const candidateMap = new Map<string, number>();

      // Tomar una ráfaga rápida de 3 fotos
      for (let i = 0; i < 3; i++) {
        const photo = await cameraRef.current.takePhoto({
          qualityPrioritization: 'speed', // 'speed' es esencial para ráfagas continuas
          flash: 'off',
        });

        console.log(`📸 [FOTO ${i+1}/3] Captura exitosa`);

        const result = await TextRecognition.recognize("file://" + photo.path);
        const blocks = result.blocks || [];

        for (const block of blocks) {
          const text = block.text || "";
          const cleanText = text.replace(/\D/g, "");
          const match = cleanText.match(/\d{5,15}/);

          if (match) {
            const currentMatch = match[0];
            candidateMap.set(currentMatch, (candidateMap.get(currentMatch) || 0) + 1);
          }
        }
      }

      // Convertimos el mapa en un Array ordenado por frecuencia de aparición (los que más salieron en la ráfaga van primero)
      const sortedCandidates = Array.from(candidateMap.entries())
        .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length) // En caso de empate, prioriza el más largo
        .map(([clean, count]) => ({ clean, raw: `Apareció en ${count} foto(s)` }));

      setAllResults(sortedCandidates);

      if (sortedCandidates.length > 0) {
        const bestMatch = sortedCandidates[0].clean;
        console.log("🎯 [FOTO-IA] Mejor candidato consolidado:", bestMatch);
        setDetectedValue(bestMatch);
        Vibration.vibrate([0, 100, 100, 100]); // Éxito
      } else {
        Alert.alert("Sin resultados", "No se encontró ningún número de caravana en la ráfaga. Intenta acercarte.");
      }

      // Mostramos la pantalla de revisión
      setIsReviewing(true);

    } catch (e) {
      console.log("Error procesando foto:", e);
      Alert.alert("Error", "No se pudo procesar la imagen.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- ACCIONES DEL USUARIO ---

  const confirmSave = () => {
    if (!detectedValue) return;

    // Guardado local
    const nuevaCaravana: Caravana = {
      id: Date.now().toString(),
      tag: detectedValue,
      confidence: 100, // En foto estática asumimos alta confianza
      scannedAt: new Date().toISOString(),
      isSynced: false
    };
    LocalRepo.save(nuevaCaravana);

    setIsReviewing(false);
    setDetectedValue(null);
    setAllResults([]);

    console.log("✅ [DB] GUARDADO EN HISTORIAL DESDE FOTO:", detectedValue);
    Vibration.vibrate([0, 50, 50, 50]);
  };

  // --- RENDERIZADOS DE CARGA / ERRORES ---

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.instruction}>Cargando permisos de cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.instruction}>Sin permiso de cámara.</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.instruction}>No se detectó ninguna cámara.</Text>
      </View>
    );
  }

  // --- RENDERIZADO PRINCIPAL ---

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.cameraPreview}
        device={device}
        isActive={!isReviewing} // Mantenemos la cámara encendida durante el "isProcessing"
        photo={true} 
      />

      {/* OVERLAY DE GUÍA */}
      {!isReviewing && !isProcessing && (
        <View style={styles.overlay}>
          <View style={styles.focusFrame} />
          <Text style={styles.instruction}>
            Modo Foto Estática: Enfoca y dispara
          </Text>
        </View>
      )}

      {/* BOTÓN DE DISPARO */}
      {!isReviewing && !isProcessing && (
        <View style={styles.captureButtonContainer}>
          <TouchableOpacity 
            style={styles.captureButton}
            onPress={takePhotoAndScan}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      )}

      {/* PANTALLA DE CARGA */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#FF9500" />
          <Text style={styles.instruction}>Analizando foto 4K...</Text>
        </View>
      )}

      {/* PANEL DE CONFIRMACIÓN */}
      {isReviewing && !isProcessing && (
        <View style={styles.reviewOverlay}>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewLabel}>CONFIRMAR NÚMERO DE FOTO</Text>
            
            <TextInput
              style={styles.reviewInput}
              value={detectedValue || ""}
              onChangeText={setDetectedValue}
              keyboardType="numeric"
              placeholder="---"
              placeholderTextColor="#555"
            />

            {/* Muestra los candidatos de la ráfaga ordenados por repetición */}
            {allResults.length > 0 && (
              <ScrollView style={styles.resultList}>
                <Text style={styles.reviewLabel}>Candidatos de la Ráfaga (Toca para elegir):</Text>
                {allResults.map((res, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={styles.resultItem}
                    onPress={() => setDetectedValue(res.clean)}
                  >
                    <Text style={styles.resultTextClean}>{res.clean}</Text>
                    <Text style={styles.resultTextRaw}>{res.raw}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={styles.reviewActionGroup}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setIsReviewing(false);
                  setDetectedValue(null);
                  setAllResults([]);
                }} 
              >
                <Text style={styles.retryText}>DESCARTAR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, !detectedValue && {opacity: 0.5}]}
                onPress={confirmSave}
                disabled={!detectedValue}
              >
                <Text style={styles.confirmText}>GUARDAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

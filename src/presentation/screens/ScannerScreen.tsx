// import React, { useState } from "react";
// import {
//   Text,
//   View,
//   TouchableOpacity,
//   Alert,
//   Vibration,
//   TextInput,
// } from "react-native";
// import {
//   Camera,
//   useCameraDevice,
//   useFrameProcessor,
// } from "react-native-vision-camera";
// import { scanOCR } from "@milvoj/vision-camera-ocr";
// import { runOnJS, useSharedValue } from "react-native-reanimated";
// import { useCameraPermissions } from "../hooks/useCameraPermissions";
// import { LocalRepo } from "../../infrastructure/storage/LocalRepo";
// import { SyncService } from "../../infrastructure/api/SyncService";
// import { Caravana } from "../../core/entities/Caravana";
// import { styles } from "./ScannerScreen.styles";

// export const ScannerScreen = () => {
//   const device = useCameraDevice("back");
//   const hasPermission = useCameraPermissions();

//   const [lastScanned, setLastScanned] = useState<string | null>(null);
//   const [isSyncing, setIsSyncing] = useState(false);

//   // Lógica de estabilidad (SharedValues para alta velocidad)
//   const lastFound = useSharedValue<string>("");
//   const stableCount = useSharedValue<number>(0);

//   // Estados para el flujo de revisión
//   const [detectedValue, setDetectedValue] = useState<string | null>(null);
//   const [isReviewing, setIsReviewing] = useState(false);

//   // Función para manejar el hallazgo una vez estabilizado
//   const onStabilityReached = runOnJS((text: string) => {
//     setDetectedValue(text);
//     setIsReviewing(true);
//     Vibration.vibrate(100);
//     console.log("🎯 [IA] DETECCIÓN ESTABLE CONFIRMADA:", text);

//     // Reseteamos contadores para la próxima
//     stableCount.value = 0;
//     lastFound.value = "";
//   });

//   // Frame Processor - SIEMPRE ACTIVO Y FIJO
//   const frameProcessor = useFrameProcessor(
//     (frame) => {
//       "worklet";

//       // Si ya estamos revisando uno, no seguimos procesando para ahorrar recursos
//       if (isReviewing) return;

//       try {
//         const data = scanOCR(frame);
//         if (data && (data as any).result) {
//           const blocks = (data as any).result.blocks || [];
//           for (const block of blocks) {
//             const text = block.text || "";
//             const match = text.match(/\d{10,15}/); // Filtramos números de 10 a 15 dígitos para mayor precisión

//             if (match) {
//               const currentMatch = match[0];

//               // Lógica de estabilidad: debe coincidir durante X cuadros
//               if (currentMatch === lastFound.value) {
//                 stableCount.value += 1;
//                 if (stableCount.value >= 2) {
//                   // 2 veces más el original (3 frames seguidos)
//                   onStabilityReached(currentMatch);
//                   return;
//                 }
//               } else {
//                 lastFound.value = currentMatch;
//                 stableCount.value = 0;
//               }

//               // Log en terminal para que el usuario sepa que la IA está viva
//               console.log(
//                 "🔍 [IA] Viendo:",
//                 currentMatch,
//                 `(Estabilidad: ${stableCount.value})`,
//               );
//             }
//           }
//         }
//       } catch (e) { }
//     },
//     [isReviewing],
//   );

//   const confirmSave = () => {
//     if (!detectedValue) return;

//     const nuevaCaravana = new Caravana(detectedValue, "BOVINO", new Date());
//     LocalRepo.save(nuevaCaravana);
//     setLastScanned(detectedValue);
//     setIsReviewing(false);
//     setDetectedValue(null);

//     console.log("✅ [MMKV] GUARDADO EN HISTORIAL:", detectedValue);
//     Vibration.vibrate([0, 50, 50, 50]);
//   };

//   const handleSync = async () => {
//     setIsSyncing(true);
//     await SyncService.syncPending();
//     setIsSyncing(false);
//     Alert.alert("Sincronización", "Datos enviados al servidor.");
//   };

//   if (hasPermission === null)
//     return (
//       <View style={styles.container}>
//         <Text>Cargando...</Text>
//       </View>
//     );
//   if (hasPermission === false)
//     return (
//       <View style={styles.container}>
//         <Text>Sin permiso de cámara</Text>
//       </View>
//     );
//   if (!device)
//     return (
//       <View style={styles.container}>
//         <Text>Cámara no encontrada</Text>
//       </View>
//     );

//   return (
//     <View style={styles.container}>
//       <Camera
//         style={styles.cameraPreview}
//         device={device}
//         isActive={!isReviewing}
//         frameProcessor={frameProcessor}
//       />

//       {/* Overlay de Guía Constante */}
//       {!isReviewing && (
//         <View style={styles.overlay}>
//           <View style={styles.focusFrame} />
//           <Text style={styles.instruction}>
//             Observación Fija: Mantén el número en el recuadro
//           </Text>
//         </View>
//       )}

//       {/* PANEL DE CONFIRMACIÓN */}
//       {isReviewing && (
//         <View style={styles.reviewOverlay}>
//           <View style={styles.reviewCard}>
//             <Text style={styles.reviewLabel}>CONFIRMAR NÚMERO</Text>
//             <TextInput
//               style={styles.reviewInput}
//               value={detectedValue || ""}
//               onChangeText={setDetectedValue}
//               keyboardType="numeric"
//             />

//             <View style={styles.reviewActionGroup}>
//               <TouchableOpacity
//                 style={styles.retryButton}
//                 onPress={() => setIsReviewing(false)}
//               >
//                 <Text style={styles.retryText}>DESCARTAR</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.confirmButton}
//                 onPress={confirmSave}
//               >
//                 <Text style={styles.confirmText}>GUARDAR</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       )}

//       {/* UI Inferior */}
//       {!isReviewing && (
//         <View style={styles.bottomBar}>
//           <Text style={styles.status}>
//             Último guardado: {lastScanned || "---"}
//           </Text>
//           <TouchableOpacity
//             style={[styles.syncButton, isSyncing && styles.buttonDisabled]}
//             onPress={handleSync}
//             disabled={isSyncing}
//           >
//             <Text style={styles.syncText}>SINCRONIZAR AHORA</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// };


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

// IMPORTANTE: Ajusta estas rutas a la estructura real de tu proyecto
import { useCameraPermissions } from "../hooks/useCameraPermissions";
import { LocalRepo } from "../../infrastructure/storage/LocalRepo";
import { SyncService } from "../../infrastructure/api/SyncService";
import { Caravana } from "../../core/entities/Caravana";
import { styles } from "./ScannerScreen.styles";

export const ScannerScreen = () => {
  // Configuración de la cámara
  const device = useCameraDevice("back");
  const hasPermission = useCameraPermissions();

  // Estados de la UI
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [detectedValue, setDetectedValue] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  // --- LÓGICA DE ESTABILIDAD PARA EL OCR ---
  // Usamos SharedValues porque el Frame Processor corre en un hilo secundario (UI Thread) a alta velocidad
  const lastFound = useSharedValue<string>("");
  const stableCount = useSharedValue<number>(0);
  const missCount = useSharedValue<number>(0); // Tolerancia a lecturas interrumpidas

  // Función que se ejecuta en el hilo principal de JS cuando encontramos un número estable
  const onStabilityReached = runOnJS((text: string) => {
    setDetectedValue(text);
    setIsReviewing(true); // Pausamos el escaneo para que el usuario confirme
    Vibration.vibrate(100); // Feedback háptico
    console.log("🎯 [IA] DETECCIÓN ESTABLE CONFIRMADA:", text);

    // Reseteamos contadores para la próxima lectura
    stableCount.value = 0;
    lastFound.value = "";
  });

  // Procesador de cuadros (Frame Processor)
  const frameProcessor = useFrameProcessor(

    (frame) => {
      "worklet";

      // Si el usuario está revisando un número, ignoramos los frames para ahorrar batería/CPU
      if (isReviewing) return;

      try {
        const data = scanOCR(frame);
        if (data && (data as any).result) {
          const blocks = (data as any).result.blocks || [];

          let bestMatchInFrame = "";

          for (const block of blocks) {
            const text = block.text || "";
            // 1. Limpiamos: Eliminamos cualquier cosa que no sea un número (espacios, letras, símbolos)
            const cleanText = text.replace(/\D/g, "");

            // 2. Filtramos: Verificamos si nos quedó un bloque numérico válido
            const match = cleanText.match(/\d{5,15}/);
            console.log('Bloque CRUDO:', text, '| LIMPIO:', cleanText);

            if (match) {
              const currentMatch = match[0];
              // Seleccionamos el número más largo como el ganador de este frame
              if (currentMatch.length > bestMatchInFrame.length) {
                bestMatchInFrame = currentMatch;
              }
            }
          }

          // Sólo evaluamos la estabilidad UNA VEZ por frame con el número ganador
          if (bestMatchInFrame !== "") {
            // METODOLOGÍA DE ESTABILIDAD CON TOLERANCIA
            if (bestMatchInFrame === lastFound.value) {
              stableCount.value += 1;
              missCount.value = 0; // Un buen hilo reinicia la tolerancia

              // Si lo vimos 3 veces seguidas reales
              if (stableCount.value >= 2) {
                onStabilityReached(bestMatchInFrame);
                return; // Salimos del procesador
              }
            } else {
              missCount.value += 1;
              // Toleramos 1 frame de ruido. Si falla 2 veces seguidas o es el primero, cambiamos de objetivo.
              if (missCount.value >= 2 || lastFound.value === "") {
                  lastFound.value = bestMatchInFrame;
                  stableCount.value = 0;
                  missCount.value = 0;
              }
            }

            console.log(
              `🎯 [IA] Ganador del Frame: ${bestMatchInFrame} (Estabilidad: ${stableCount.value}/2)`
            );
          }
        }
      } catch (e) {
        // Silenciamos errores menores del OCR por frame
        console.log("Error en Frame Processor:", e);
      }
    },
    [isReviewing] // Dependencia: si cambia isReviewing, el worklet se actualiza
  );

  // --- ACCIONES DEL USUARIO ---

  const confirmSave = () => {
    if (!detectedValue) return;

    const nuevaCaravana: Caravana = {
      id: Date.now().toString(),
      tag: detectedValue,
      confidence: 100,
      scannedAt: new Date().toISOString(),
      isSynced: false
    };
    LocalRepo.save(nuevaCaravana);

    // Actualizamos UI
    setLastScanned(detectedValue);
    setIsReviewing(false); // Volvemos a activar la cámara
    setDetectedValue(null);

    console.log("✅ [DB] GUARDADO EN HISTORIAL:", detectedValue);
    Vibration.vibrate([0, 50, 50, 50]); // Feedback de éxito
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await SyncService.syncPending();
      Alert.alert("Éxito", "Datos sincronizados con el servidor.");
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al sincronizar.");
    } finally {
      setIsSyncing(false);
    }
  };

  // --- RENDERIZADOS DE CARGA / ERRORES ---

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Cargando permisos de cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>Sin permiso de cámara. Ve a la configuración de tu teléfono.</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text>No se detectó ninguna cámara en este dispositivo.</Text>
      </View>
    );
  }

  // --- RENDERIZADO PRINCIPAL ---

  return (
    <View style={styles.container}>
      <Camera
        style={styles.cameraPreview}
        device={device}
        isActive={!isReviewing} // Apaga el feed si estamos revisando
        frameProcessor={frameProcessor}
      />

      {/* OVERLAY DE GUÍA: Se muestra solo cuando la cámara está activa buscando */}
      {!isReviewing && (
        <View style={styles.overlay}>
          <View style={styles.focusFrame} />
          <Text style={styles.instruction}>
            Mantén la caravana en el recuadro hasta que se detecte.
          </Text>
        </View>
      )}

      {/* PANEL DE CONFIRMACIÓN: Se muestra cuando se detectó algo estable */}
      {isReviewing && (
        <View style={styles.reviewOverlay}>
          <View style={styles.reviewCard}>
            <Text style={styles.reviewLabel}>CONFIRMAR NÚMERO</Text>

            <TextInput
              style={styles.reviewInput}
              value={detectedValue || ""}
              onChangeText={setDetectedValue} // Permite al usuario corregir a mano si la IA falló un dígito
              keyboardType="numeric"
            />

            <View style={styles.reviewActionGroup}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => setIsReviewing(false)} // Vuelve a intentar
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

      {/* BARRA INFERIOR: Último escaneo y sincronización */}
      {!isReviewing && (
        <View style={styles.bottomBar}>
          <Text style={styles.status}>
            Último guardado: {lastScanned || "Ninguno"}
          </Text>
          <TouchableOpacity
            style={[styles.syncButton, isSyncing && styles.buttonDisabled]}
            onPress={handleSync}
            disabled={isSyncing}
          >
            <Text style={styles.syncText}>
              {isSyncing ? "SINCRONIZANDO..." : "SINCRONIZAR AHORA"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
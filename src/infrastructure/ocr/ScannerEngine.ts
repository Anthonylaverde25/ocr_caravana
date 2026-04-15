import { useTextRecognition } from 'react-native-vision-camera-mlkit';
import { useCallback } from 'react';
import { runAtTargetVideoFps } from 'react-native-vision-camera';

/**
 * Hook para manejar la detección de texto en tiempo real.
 * Utiliza runAtTargetVideoFps para no saturar el CPU.
 */
export const useCaravanaScanner = (onDetect: (text: string, confidence: number) => void) => {
  const { scanText } = useTextRecognition();

  const frameProcessor = useCallback((frame: any) => {
    'worklet';
    
    // Solo procesamos a 5 FPS para ahorrar batería y CPU
    runAtTargetVideoFps(5, () => {
      'worklet';
      const result = scanText(frame);
      
      if (result.blocks && result.blocks.length > 0) {
        // Lógica de filtrado de "caravanas"
        // TODO: Mejorar regex según el formato real
        for (const block of result.blocks) {
          const text = block.text.trim();
          
          // Ejemplo: Buscar secuencias numéricas de 4 a 15 dígitos
          const match = text.match(/\d{4,15}/);
          if (match) {
            //onDetect(match[0], 0.9); // ML Kit v2 no da confianza por bloque fácilmente en JS
          }
        }
      }
    });
  }, [scanText]);

  return { frameProcessor };
};

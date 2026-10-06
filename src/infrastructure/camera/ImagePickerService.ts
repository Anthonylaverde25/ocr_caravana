import { Alert } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';

export interface PickedImageResult {
  uri: string;
  name: string;
  mimeType: string;
}

export class ImagePickerService {
  /**
   * Checks if ExponentImagePicker is present in the native binary without crashing.
   */
  static isAvailable(): boolean {
    try {
      const nativeModule = requireOptionalNativeModule('ExponentImagePicker');
      return Boolean(nativeModule);
    } catch {
      return false;
    }
  }

  /**
   * Opens the native gallery picker if compiled, or provides instructions.
   */
  static async pickFromGallery(): Promise<PickedImageResult | null> {
    const available = this.isAvailable();

    if (!available) {
      Alert.alert(
        'Galería Requiere Recompilar',
        'El módulo de galería de fotos requiere que la app nativa en tu teléfono sea recompilada una vez para enlazar el selector del sistema.\n\n• En iPhone: corré "npx expo run:ios"\n• En Samsung: corré "npx expo run:android"\n\nMientras tanto, podés usar "Tomar Foto" con la cámara en vivo o probar las planillas desde "Simular".',
        [{ text: 'Entendido' }]
      );
      return null;
    }

    try {
      // Safe to require expo-image-picker since ExponentImagePicker exists natively in this build
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ImagePicker = require('expo-image-picker');

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso Denegado',
          'Se necesita acceso a la galería de fotos para seleccionar la planilla.',
          [{ text: 'Entendido' }]
        );
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          name: asset.fileName || `planilla_${Date.now()}.jpg`,
          mimeType: asset.mimeType || 'image/jpeg',
        };
      }
      return null;
    } catch (err: any) {
      Alert.alert('Error de Galería', err.message || 'No se pudo abrir la galería.');
      return null;
    }
  }

  /**
   * Captures photo using system picker if available, otherwise returns null for VisionCamera.
   */
  static async takePhotoWithPicker(): Promise<PickedImageResult | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ImagePicker = require('expo-image-picker');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          name: asset.fileName || `planilla_${Date.now()}.jpg`,
          mimeType: asset.mimeType || 'image/jpeg',
        };
      }
      return null;
    } catch {
      return null;
    }
  }
}

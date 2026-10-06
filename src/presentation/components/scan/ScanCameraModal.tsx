import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Linking,
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { X, Zap, ZapOff, Settings, RefreshCw } from 'lucide-react-native';
import { PickedImageResult } from '../../../infrastructure/camera/ImagePickerService';

interface ScanCameraModalProps {
  visible: boolean;
  onCapture: (result: PickedImageResult) => void;
  onClose: () => void;
}

export function ScanCameraModal({ visible, onCapture, onClose }: ScanCameraModalProps) {
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [isCapturing, setIsCapturing] = useState(false);

  const checkAndRequestPermission = async () => {
    try {
      const current = await Camera.getCameraPermissionStatus();
      if (current === 'granted') {
        setHasPermission(true);
        return;
      }
      const requested = await Camera.requestCameraPermission();
      setHasPermission(requested === 'granted');
    } catch {
      setHasPermission(false);
    }
  };

  useEffect(() => {
    if (visible) {
      checkAndRequestPermission();
    }
  }, [visible]);

  const handleTakePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePhoto({
        flash,
        enableShutterSound: true,
      });

      const uri = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
      onCapture({
        uri,
        name: `planilla_${Date.now()}.jpg`,
        mimeType: 'image/jpeg',
      });
      onClose();
    } catch (err: any) {
      console.error('Error taking photo:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />

        {hasPermission === null ? (
          <View style={styles.permissionBox}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loadingText}>Comprobando permisos de cámara...</Text>
          </View>
        ) : hasPermission === false ? (
          <View style={styles.permissionBox}>
            <Text style={styles.permissionTitle}>Permiso de Cámara Denegado</Text>
            <Text style={styles.permissionSubtitle}>
              La app necesita acceso a la cámara para fotografiar y digitalizar planillas en manga. Habilitá el permiso en los ajustes del dispositivo.
            </Text>
            <TouchableOpacity
              style={styles.openSettingsBtn}
              onPress={() => Linking.openSettings()}
            >
              <Settings size={18} color="#FFFFFF" />
              <Text style={styles.openSettingsBtnText}>Abrir Ajustes del Teléfono</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={checkAndRequestPermission}
            >
              <RefreshCw size={16} color="#059669" />
              <Text style={styles.retryBtnText}>Reintentar Permiso</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtnSimple} onPress={onClose}>
              <Text style={styles.closeBtnText}>Volver</Text>
            </TouchableOpacity>
          </View>
        ) : !device ? (
          <View style={styles.permissionBox}>
            <Text style={styles.permissionTitle}>Cámara no disponible</Text>
            <Text style={styles.permissionSubtitle}>
              No se detectó un sensor de cámara trasera activo en este dispositivo o simulador.
            </Text>
            <TouchableOpacity style={styles.closeBtnSimple} onPress={onClose}>
              <Text style={styles.closeBtnText}>Volver</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={StyleSheet.absoluteFill}>
            <Camera
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={visible}
              photo={true}
            />

            {/* Guía visual para encuadrar la planilla en manga */}
            <View style={styles.overlay}>
              <View style={styles.topBar}>
                <TouchableOpacity style={styles.iconBtn} onPress={onClose}>
                  <X size={26} color="#FFFFFF" />
                </TouchableOpacity>

                <Text style={styles.guideTitle}>Encuadrar Planilla</Text>

                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}
                >
                  {flash === 'on' ? (
                    <Zap size={24} color="#FBBF24" />
                  ) : (
                    <ZapOff size={24} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.framingContainer}>
                <View style={styles.sheetFrame} />
                <Text style={styles.framingHint}>
                  Alineá los bordes de la planilla dentro del marco
                </Text>
              </View>

              {/* Botón de captura / obturador */}
              <View style={styles.bottomBar}>
                <TouchableOpacity
                  style={[styles.shutterBtn, isCapturing && styles.shutterBtnDisabled]}
                  onPress={handleTakePhoto}
                  disabled={isCapturing}
                  activeOpacity={0.7}
                >
                  {isCapturing ? (
                    <ActivityIndicator size="small" color="#059669" />
                  ) : (
                    <View style={styles.shutterInner} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  permissionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#E5E7EB',
    marginTop: 12,
  },
  openSettingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    marginTop: 8,
  },
  openSettingsBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  retryBtnText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
  },
  closeBtnSimple: {
    backgroundColor: '#374151',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingBottom: 12,
  },
  iconBtn: {
    padding: 6,
  },
  guideTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  framingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  sheetFrame: {
    width: '100%',
    aspectRatio: 0.72, // Proporción hoja A4 / oficio
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 8,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  framingHint: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bottomBar: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingBottom: 16,
  },
  shutterBtn: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shutterBtnDisabled: {
    opacity: 0.5,
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
});

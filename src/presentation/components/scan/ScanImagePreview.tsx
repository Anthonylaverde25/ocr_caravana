import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Maximize2, X, RefreshCw } from 'lucide-react-native';
import { colors } from '../../reader/theme';

interface ScanImagePreviewProps {
  imageUri: string;
  imageName?: string;
  onRetake: () => void;
}

export function ScanImagePreview({ imageUri, imageName, onRetake }: ScanImagePreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.previewHeader}>
        <Text style={styles.headerTitle}>HOJA CAPTURADA</Text>
        <Text style={styles.headerSubtitle} numberOfLines={1}>
          {imageName || 'worksheet.jpg'}
        </Text>
      </View>

      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: imageUri }} style={styles.thumbnail} resizeMode="cover" />

        <View style={styles.overlayBar}>
          <TouchableOpacity
            style={styles.overlayBtn}
            onPress={() => setIsFullscreen(true)}
            activeOpacity={0.8}
          >
            <Maximize2 size={16} color="#FFFFFF" />
            <Text style={styles.overlayBtnText}>Ver Completa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.overlayBtn, styles.retakeBtn]}
            onPress={onRetake}
            activeOpacity={0.8}
          >
            <RefreshCw size={15} color="#FFFFFF" />
            <Text style={styles.overlayBtnText}>Cambiar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Fullscreen Modal */}
      <Modal
        visible={isFullscreen}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setIsFullscreen(false)}
      >
        <SafeAreaView style={styles.fullscreenContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{imageName || 'Planilla Capturada'}</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setIsFullscreen(false)}
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalImageWrap}>
            <Image
              source={{ uri: imageUri }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.muted,
    maxWidth: '60%',
  },
  thumbnailContainer: {
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#111827',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  overlayBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  retakeBtn: {
    backgroundColor: 'rgba(5, 150, 105, 0.85)',
  },
  overlayBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
  modalImageWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
});

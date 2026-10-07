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
import { colors, fonts, radius } from '../../reader/theme';

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
        <Text style={styles.headerTitle}>Hoja capturada</Text>
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
            <Maximize2 size={16} color={colors.surface} />
            <Text style={styles.overlayBtnText}>Ver Completa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.overlayBtn, styles.retakeBtn]}
            onPress={onRetake}
            activeOpacity={0.8}
          >
            <RefreshCw size={15} color={colors.surface} />
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
          <StatusBar barStyle="light-content" backgroundColor={colors.media} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{imageName || 'Planilla Capturada'}</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setIsFullscreen(false)}
            >
              <X size={24} color={colors.surface} />
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
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
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
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  headerSubtitle: {
    fontFamily: fonts.regular, fontSize: 12,
    color: colors.muted,
    maxWidth: '60%',
  },
  thumbnailContainer: {
    height: 120,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.text,
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
    backgroundColor: colors.mediaScrim,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    gap: 6,
  },
  retakeBtn: {
    backgroundColor: colors.primaryScrim,
  },
  overlayBtnText: {
    color: colors.surface,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: colors.media,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.mediaDivider,
  },
  modalTitle: {
    color: colors.surface,
    fontSize: 16,
    fontFamily: fonts.medium,
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

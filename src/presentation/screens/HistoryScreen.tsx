import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { LocalRepo } from '../../infrastructure/storage/LocalRepo';
import { Caravana } from '../../core/entities/Caravana';
import { CheckCircle, Clock, Trash2, RefreshCcw } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../reader/theme';
import { AppHeader } from '../components/AppHeader';

export const HistoryScreen = () => {
  const [caravanas, setCaravanas] = useState<Caravana[]>([]);

  const loadData = () => {
    const data = LocalRepo.getAll();
    // Ordenar por fecha (más recientes primero)
    const sorted = [...data].sort((a, b) => 
      new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
    );
    setCaravanas(sorted);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleClear = () => {
    Alert.alert(
      "Limpiar Historial",
      "¿Estás seguro de que quieres borrar todos los registros locales?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Borrar Todo", 
          style: "destructive",
          onPress: () => {
            LocalRepo.clearAll();
            loadData();
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Caravana }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.tagText}>{item.tag}</Text>
        <Text style={styles.dateText}>
          {new Date(item.scannedAt).toLocaleString()}
        </Text>
      </View>
      <View style={styles.cardRight}>
        {item.isSynced ? (
          <View style={styles.badgeSynced}>
            <CheckCircle size={16} color={colors.primary} />
            <Text style={styles.badgeTextSynced}>Sincronizado</Text>
          </View>
        ) : (
          <View style={styles.badgePending}>
            <Clock size={16} color="#FF9800" />
            <Text style={styles.badgeTextPending}>Pendiente</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Minimalista Profesional Verde Esmeralda */}
      <AppHeader
        title="HISTORIAL"
        subtitle="Buffer de Lecturas Locales"
      />

      <View style={styles.subHeader}>
        <Text style={styles.subTitle}>
          {caravanas.length} {caravanas.length === 1 ? 'registro en memoria' : 'registros en memoria'}
        </Text>
        {caravanas.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton} accessibilityLabel="Limpiar historial">
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={caravanas}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay capturas guardadas en la memoria local aún.</Text>
          </View>
        }
        onRefresh={loadData}
        refreshing={false}
      />
      
      <TouchableOpacity 
        style={styles.refreshFab} 
        onPress={loadData}
        activeOpacity={0.8}
        accessibilityLabel="Actualizar lista"
      >
        <RefreshCcw size={22} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  subHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subTitle: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  clearButton: { padding: 6, borderRadius: 6, backgroundColor: '#FEE2E2' },
  listContent: { padding: 16, gap: 10 },
  card: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: colors.surface, 
    padding: 14, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: colors.border,
  },
  cardLeft: { flex: 1, gap: 3 },
  tagText: { fontSize: 16, fontWeight: '700', color: colors.text, fontFamily: 'monospace' },
  dateText: { fontSize: 12, color: colors.muted },
  cardRight: { marginLeft: 10 },
  badgeSynced: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.primaryBg, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6, 
    gap: 4 
  },
  badgeTextSynced: { color: colors.primaryDark, fontSize: 11, fontWeight: '700' },
  badgePending: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF3E0', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6, 
    gap: 4 
  },
  badgeTextPending: { color: '#E65100', fontSize: 11, fontWeight: '700' },
  emptyContainer: { 
    padding: 30, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 20,
  },
  emptyText: { color: colors.muted, fontSize: 14, textAlign: 'center' },
  refreshFab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  }
});

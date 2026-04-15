import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { LocalRepo } from '../../infrastructure/storage/LocalRepo';
import { Caravana } from '../../core/entities/Caravana';
import { CheckCircle, Clock, Trash2, RefreshCcw } from 'lucide-react-native';

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

  useEffect(() => {
    loadData();
    // Podríamos agregar un listener aquí si quisiéramos tiempo real absoluto
  }, []);

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
            <CheckCircle size={16} color="#4CAF50" />
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
      <View style={styles.header}>
        <Text style={styles.title}>Registros Locales</Text>
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Trash2 size={20} color="#FF5252" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={caravanas}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay capturas guardadas aún.</Text>
          </View>
        }
        onRefresh={loadData}
        refreshing={false}
      />
      
      <TouchableOpacity 
        style={styles.refreshFab} 
        onPress={loadData}
      >
        <RefreshCcw size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1C1C1E' },
  clearButton: { padding: 5 },
  listContent: { padding: 15 },
  card: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  cardLeft: { flex: 1 },
  tagText: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 4 },
  dateText: { fontSize: 13, color: '#8E8E93' },
  cardRight: { justifyContent: 'center' },
  badgeSynced: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#E8F5E9', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6 
  },
  badgePending: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF3E0', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6 
  },
  badgeTextSynced: { color: '#4CAF50', fontSize: 11, fontWeight: '600', marginLeft: 4 },
  badgeTextPending: { color: '#FF9800', fontSize: 11, fontWeight: '600', marginLeft: 4 },
  emptyContainer: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#8E8E93', fontSize: 16 },
  refreshFab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  }
});

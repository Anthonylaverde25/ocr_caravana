import { MMKV } from 'react-native-mmkv';
import { Caravana } from '../../core/entities/Caravana';

const storage = new MMKV({
  id: 'caravana-storage',
  encryptionKey: 'some-secure-key' // Opcional, pero recomendado
});

const CARAVANAS_KEY = 'caravanas_list';

export const LocalRepo = {
  /**
   * Obtiene todas las caravanas guardadas localmente.
   */
  getAll: (): Caravana[] => {
    const data = storage.getString(CARAVANAS_KEY);
    return data ? JSON.parse(data) : [];
  },

  /**
   * Guarda una nueva caravana o actualiza una existente.
   */
  save: (caravana: Caravana): void => {
    const list = LocalRepo.getAll();
    const index = list.findIndex(c => c.id === caravana.id);
    
    if (index >= 0) {
      list[index] = caravana;
    } else {
      list.push(caravana);
    }
    
    storage.set(CARAVANAS_KEY, JSON.stringify(list));
  },

  /**
   * Obtiene solo las caravanas que no han sido sincronizadas.
   */
  getPendingSync: (): Caravana[] => {
    return LocalRepo.getAll().filter(c => !c.isSynced);
  },

  /**
   * Marca una caravana como sincronizada.
   */
  markAsSynced: (id: string): void => {
    const list = LocalRepo.getAll();
    const index = list.findIndex(c => c.id === id);
    if (index >= 0) {
      list[index].isSynced = true;
      storage.set(CARAVANAS_KEY, JSON.stringify(list));
    }
  },

  /**
   * Limpia todos los datos (útil para pruebas).
   */
  clearAll: (): void => {
    storage.delete(CARAVANAS_KEY);
  }
};

import axios from 'axios';
import { Caravana } from '../../core/entities/Caravana';
import { LocalRepo } from '../storage/LocalRepo';

// TODO: Cambiar esto en producción por una variable de entorno (.env)
const BASE_URL = 'http://192.168.1.100:8000/api'; // Ejemplo local

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

export const SyncService = {
  /**
   * Intenta sincronizar todas las caravanas pendientes.
   */
  syncPending: async (): Promise<void> => {
    const list = LocalRepo.getPendingSync();
    if (list.length === 0) return;

    for (const caravana of list) {
      try {
        const response = await api.post('/caravanas/ingesta', {
          tag: caravana.tag,
          confidence: caravana.confidence,
          metadata: {
            ...caravana.metadata,
            scannedAt: caravana.scannedAt,
            id: caravana.id
          }
        });

        if (response.status === 201 || response.status === 200) {
          LocalRepo.markAsSynced(caravana.id);
        }
      } catch (error) {
        console.error(`Error sincronizando caravana ${caravana.id}:`, error);
        // Si hay error (e.g. timeout), dejamos de intentar la ráfaga
        break; 
      }
    }
  }
};

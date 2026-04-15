export interface Caravana {
  id: string; // Identificador único local (UUID o timestamp)
  tag: string; // El número de caravana reconocido por OCR
  confidence: number; // Porcentaje de confianza del OCR
  scannedAt: string; // ISO string de la fecha y hora del escaneo
  isSynced: boolean; // Estado de sincronización con el servidor Laravel
  metadata?: {
    latitude?: number;
    longitude?: number;
    imagePath?: string; // Por si guardamos la imagen reducida
  };
}

export type CaravanaCreateDto = Pick<Caravana, 'tag' | 'confidence' | 'metadata'>;

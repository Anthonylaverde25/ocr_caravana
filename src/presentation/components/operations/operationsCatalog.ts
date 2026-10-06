export type OperationCategory = 'TODAS' | 'MANGA' | 'REPRODUCCIÓN' | 'SANIDAD' | 'LOGÍSTICA';

export interface OperationItem {
  id: string;
  title: string;
  category: OperationCategory;
  categoryLabel: string;
  description: string;
  iconName:
    | 'tag'
    | 'scale'
    | 'activity'
    | 'milk'
    | 'baby'
    | 'heart-pulse'
    | 'beef'
    | 'shield-plus'
    | 'arrow-right-left'
    | 'truck'
    | 'file-text';
  iconColor: string;
  iconBg: string;
  available: boolean;
  targetTab?: string;
  badgeLabel: string;
}

export const OPERATION_CATEGORIES: OperationCategory[] = [
  'TODAS',
  'MANGA',
  'REPRODUCCIÓN',
  'SANIDAD',
  'LOGÍSTICA',
];

export const ALL_OPERATIONS: OperationItem[] = [
  {
    id: 'escaner_planillas',
    title: 'Escáner de Planillas IA',
    category: 'MANGA',
    categoryLabel: 'PLANILLAS DE CAMPO',
    description: 'Digitalización OCR + IA de planillas físicas (ING-01, TOR-01, PAR-01, DEST-01) con cámara o galería.',
    iconName: 'file-text',
    iconColor: '#7C3AED',
    iconBg: '#F5F3FF',
    available: true,
    targetTab: 'Planillas',
    badgeLabel: 'CÁMARA / IA',
  },
  {
    id: 'alta_caravanas',
    title: 'Alta de Caravanas',
    category: 'MANGA',
    categoryLabel: 'IDENTIFICACIÓN',
    description: 'Lectura de bastón BLE en manga para alta de animales y asignación de lote.',
    iconName: 'tag',
    iconColor: '#007AFF',
    iconBg: '#EFF6FF',
    available: true,
    targetTab: 'Lector',
    badgeLabel: 'CON BASTÓN',
  },
  {
    id: 'ingreso_pesadas',
    title: 'Ingreso de Pesadas',
    category: 'MANGA',
    categoryLabel: 'BALANZA / PESO',
    description: 'Pesaje periódico en manga, control de ganancia diaria (GMD) y desbaste.',
    iconName: 'scale',
    iconColor: '#D97706',
    iconBg: '#FFFBEB',
    available: false,
    badgeLabel: 'PRÓXIMO',
  },
  {
    id: 'condicion_corporal',
    title: 'Condición Corporal',
    category: 'MANGA',
    categoryLabel: 'ZOOTECNIA',
    description: 'Puntuación de estado corporal en escala 1 a 5 con medios puntos (1.0 a 5.0).',
    iconName: 'activity',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED',
    available: false,
    badgeLabel: 'PRÓXIMO',
  },
  {
    id: 'destete_terneros',
    title: 'Destete de Terneros',
    category: 'REPRODUCCIÓN',
    categoryLabel: 'MANEJO DE CRÍA',
    description: 'Separación de camada, corte de lactancia de vientres y pesaje de entrega.',
    iconName: 'milk',
    iconColor: '#0284C7',
    iconBg: '#ECFEFF',
    available: false,
    badgeLabel: 'PRÓXIMO',
  },
  {
    id: 'registro_partos',
    title: 'Registro de Partos',
    category: 'REPRODUCCIÓN',
    categoryLabel: 'MATERNIDAD',
    description: 'Partos a campo, identificación de madre, sexo y peso al nacer del ternero.',
    iconName: 'baby',
    iconColor: '#059669',
    iconBg: '#ECFDF5',
    available: false,
    badgeLabel: 'PRÓXIMO',
  },
  {
    id: 'tacto_ecografia',
    title: 'Tacto y Ecografía',
    category: 'REPRODUCCIÓN',
    categoryLabel: 'DIAGNÓSTICO',
    description: 'Diagnóstico de preñez, vacías y tiempo de gestación por profesional habilitado.',
    iconName: 'heart-pulse',
    iconColor: '#DC2626',
    iconBg: '#FEF2F2',
    available: false,
    badgeLabel: 'PRÓXIMO',
  },
  {
    id: 'evaluacion_toros',
    title: 'Evaluación de Toros',
    category: 'SANIDAD',
    categoryLabel: 'REPRODUCTORES',
    description: 'Circunferencia escrotal, tono testicular, raspaje prepucial y aptitud.',
    iconName: 'beef',
    iconColor: '#7C3AED',
    iconBg: '#F5F3FF',
    available: false,
    badgeLabel: 'PRÓXIMO',
  },
  {
    id: 'planes_vacunacion',
    title: 'Planes Sanitarios',
    category: 'SANIDAD',
    categoryLabel: 'VACUNACIÓN',
    description: 'Aftosa, brucelosis, carbunclo y desparasitaciones periódicas con lote.',
    iconName: 'shield-plus',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4',
    available: false,
    badgeLabel: 'PRÓXIMO',
  },
  {
    id: 'cambio_destino',
    title: 'Cambio de Lote / Traslado',
    category: 'LOGÍSTICA',
    categoryLabel: 'MOVIMIENTOS',
    description: 'Movimiento de tropas entre potreros y cambio de clasificación de lotes.',
    iconName: 'arrow-right-left',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF',
    available: false,
    badgeLabel: 'PRÓXIMO',
  },
  {
    id: 'ingreso_tropa',
    title: 'Ingreso de Hacienda (DTE)',
    category: 'LOGÍSTICA',
    categoryLabel: 'RECEPCIÓN',
    description: 'Recepción de hacienda externa con DTE, control de guía y caravanas recibidas.',
    iconName: 'truck',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF',
    available: false,
    badgeLabel: 'PRÓXIMO',
  },
];

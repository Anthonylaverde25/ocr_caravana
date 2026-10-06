export type MenuCategoryKey = 'MANGA' | 'REPRODUCCION' | 'SANIDAD' | 'LOGISTICA';

export interface MenuCategoryMeta {
  key: MenuCategoryKey;
  label: string;
  description: string;
}

export interface MenuItem {
  id: string;
  title: string;
  category: MenuCategoryKey;
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
    | 'stethoscope'
    | 'arrow-right-left'
    | 'truck'
    | 'file-text';
  iconColor: string;
  iconBg: string;
  available: boolean;
  targetTab?: 'Home' | 'Lector' | 'Planillas' | 'Historial';
  badgeLabel: string;
}

export interface QuickActionItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: 'bluetooth' | 'file-text' | 'clock';
  color: string;
  bgColor: string;
  targetTab: 'Lector' | 'Planillas' | 'Historial';
}

export const MENU_CATEGORIES: MenuCategoryMeta[] = [
  {
    key: 'MANGA',
    label: 'Manga & Identificación',
    description: 'Lecturas de bastón BLE, pesaje y evaluación corporal',
  },
  {
    key: 'REPRODUCCION',
    label: 'Gestión Reproductiva',
    description: 'Maternidad, tactos de vientres, destete y torada',
  },
  {
    key: 'SANIDAD',
    label: 'Sanidad & Zootecnia',
    description: 'Planes sanitarios oficiales, vacunaciones y tratamientos',
  },
  {
    key: 'LOGISTICA',
    label: 'Logística & Movimientos',
    description: 'Traslados entre potreros y recepción con DTE',
  },
];

export const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'quick_reader',
    title: 'Lector BLE Manga',
    subtitle: 'Sesión de alta',
    iconName: 'bluetooth',
    color: '#059669',
    bgColor: '#ECFDF5',
    targetTab: 'Lector',
  },
  {
    id: 'quick_scan',
    title: 'Escanear Planilla',
    subtitle: 'Cámara / OCR IA',
    iconName: 'file-text',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    targetTab: 'Planillas',
  },
  {
    id: 'quick_history',
    title: 'Buffer & Sesiones',
    subtitle: 'Sincronización',
    iconName: 'clock',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    targetTab: 'Historial',
  },
];

export const ALL_MENU_ITEMS: MenuItem[] = [
  // Manga & Identificación
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
    iconColor: '#059669',
    iconBg: '#ECFDF5',
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

  // Gestión Reproductiva
  {
    id: 'registro_partos',
    title: 'Registro de Partos',
    category: 'REPRODUCCION',
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
    category: 'REPRODUCCION',
    categoryLabel: 'DIAGNÓSTICO',
    description: 'Diagnóstico de preñez, vientres vacíos y tiempo de gestación por profesional.',
    iconName: 'heart-pulse',
    iconColor: '#DC2626',
    iconBg: '#FEF2F2',
    available: false,
    badgeLabel: 'PRÓXIMO',
  },
  {
    id: 'destete_terneros',
    title: 'Destete de Terneros',
    category: 'REPRODUCCION',
    categoryLabel: 'MANEJO DE CRÍA',
    description: 'Separación de camada, corte de lactancia de vientres y pesaje de entrega.',
    iconName: 'milk',
    iconColor: '#0284C7',
    iconBg: '#ECFEFF',
    available: false,
    badgeLabel: 'PRÓXIMO',
  },
  {
    id: 'evaluacion_toros',
    title: 'Evaluación de Toros',
    category: 'REPRODUCCION',
    categoryLabel: 'REPRODUCTORES',
    description: 'Circunferencia escrotal, tono testicular, raspaje prepucial y aptitud de torada.',
    iconName: 'beef',
    iconColor: '#7C3AED',
    iconBg: '#F5F3FF',
    available: false,
    badgeLabel: 'PRÓXIMO',
  },

  // Sanidad & Zootecnia
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
    id: 'tratamientos_veterinarios',
    title: 'Tratamientos Veterinarios',
    category: 'SANIDAD',
    categoryLabel: 'CLÍNICA / RECETAS',
    description: 'Registro de medicamentos aplicados, dosis y período de retiro en carne/leche.',
    iconName: 'stethoscope',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF',
    available: false,
    badgeLabel: 'PRÓXIMO',
  },

  // Logística & Movimientos
  {
    id: 'cambio_destino',
    title: 'Cambio de Lote / Potrero',
    category: 'LOGISTICA',
    categoryLabel: 'MOVIMIENTOS',
    description: 'Rotación entre potreros y cambio de clasificación o destino de tropas.',
    iconName: 'arrow-right-left',
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF',
    available: false,
    badgeLabel: 'PRÓXIMO',
  },
  {
    id: 'ingreso_tropa',
    title: 'Ingreso de Hacienda (DTE)',
    category: 'LOGISTICA',
    categoryLabel: 'RECEPCIÓN',
    description: 'Recepción de hacienda externa con DTE, control de guía y caravanas recibidas.',
    iconName: 'truck',
    iconColor: '#0891B2',
    iconBg: '#ECFEFF',
    available: false,
    badgeLabel: 'PRÓXIMO',
  },
];

export type MenuCategoryKey = 'OPERACIONES' | 'LOGISTICA';

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
  subtitle?: string;
  description: string;
  iconName:
    | 'clipboard-list'
    | 'truck'
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
    | 'file-text';
  iconColor: string;
  iconBg: string;
  available: boolean;
  targetRoute: 'OperationsScreen' | 'DteScreen' | string;
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
    key: 'OPERACIONES',
    label: 'Operaciones de Campo',
    description: 'Catálogo de pesajes, tacto, reproducción y sanidad en manga',
  },
  {
    key: 'LOGISTICA',
    label: 'Logística & Tránsito',
    description: 'Recepción de tropas externas con DTE y guías oficiales',
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
  {
    id: 'operaciones',
    title: 'Operaciones',
    category: 'OPERACIONES',
    categoryLabel: 'ACTIVIDADES DE CAMPO',
    subtitle: 'Manga, Reproducción, Sanidad y Logística',
    description: 'Catálogo integral de pesadas, condición corporal, tacto, ecografía, partos y vacunaciones.',
    iconName: 'clipboard-list',
    iconColor: '#059669',
    iconBg: '#ECFDF5',
    available: true,
    targetRoute: 'OperationsScreen',
    badgeLabel: 'MÓDULOS',
  },
  {
    id: 'dte',
    title: 'DTe / Recepciones',
    category: 'LOGISTICA',
    categoryLabel: 'SENASA & GUÍAS',
    subtitle: 'Control de Hacienda y Guías de Tránsito',
    description: 'Seguimiento de hacienda en tránsito, órdenes de compra y recepción directa en manga.',
    iconName: 'truck',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF',
    available: true,
    targetRoute: 'DteScreen',
    badgeLabel: 'DTE SENASA',
  },
];

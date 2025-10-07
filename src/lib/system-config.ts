// Sistema de configuración para límites de capacidad y gestión de eventos

export interface CapacityConfig {
  maxGuestsPerEvent: number;
  maxEventsPerDay: number;
  maxGuestsPerHour: number;
  allowOverbooking: boolean;
  overbookingLimit: number;
}

export interface EventTypeConfig {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  maxCapacity: number;
  minCapacity: number;
  basePrice: number;
  hourlyRate: number;
  minHours: number;
  maxHours: number;
  requiresSpecialSetup: boolean;
  specialRequirements: string[];
  cateringOptions: string[];
  decorationOptions: string[];
  audioVisualOptions: string[];
  icon: string;
  color: string;
}

export interface DespechosEventConfig {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  maxCapacity: number;
  minCapacity: number;
  coverPrice: number;
  minHours: number;
  maxHours: number;
  requiresSpecialSetup: boolean;
  specialRequirements: string[];
  cateringOptions: string[];
  decorationOptions: string[];
  audioVisualOptions: string[];
  icon: string;
  color: string;
  additionalCosts: number;
}

// Configuración por defecto de capacidad
export const defaultCapacityConfig: CapacityConfig = {
  maxGuestsPerEvent: 450,
  maxEventsPerDay: 3,
  maxGuestsPerHour: 150,
  allowOverbooking: false,
  overbookingLimit: 50
};

// Configuración por defecto de eventos regulares
export const defaultEventTypes: EventTypeConfig[] = [
  {
    id: 'boda',
    name: 'Boda y Celebración',
    description: 'Celebra el amor con estilo',
    isActive: true,
    maxCapacity: 450,
    minCapacity: 20,
    basePrice: 45,
    hourlyRate: 3000,
    minHours: 4,
    maxHours: 12,
    requiresSpecialSetup: true,
    specialRequirements: ['Arco nupcial', 'Mesa de novios', 'Pista de baile'],
    cateringOptions: ['Menú completo', 'Cóctel de bienvenida', 'Pastel de bodas', 'Bar completo'],
    decorationOptions: ['Flores naturales', 'Candelabros', 'Mantelería premium', 'Centros de mesa'],
    audioVisualOptions: ['Sistema de audio profesional', 'Iluminación ambiental', 'Proyector para presentación', 'DJ o banda en vivo'],
    icon: 'Heart',
    color: '#ef4444'
  },
  {
    id: 'corporativo',
    name: 'Evento Corporativo',
    description: 'Profesionalismo y elegancia',
    isActive: true,
    maxCapacity: 450,
    minCapacity: 10,
    basePrice: 35,
    hourlyRate: 3000,
    minHours: 2,
    maxHours: 8,
    requiresSpecialSetup: false,
    specialRequirements: ['Pódium', 'Sistema de presentación'],
    cateringOptions: ['Coffee break', 'Almuerzo ejecutivo', 'Refrigerios', 'Bebidas'],
    decorationOptions: ['Branding corporativo', 'Banderas', 'Mantelería ejecutiva'],
    audioVisualOptions: ['Proyector HD', 'Sistema de audio', 'Micrófonos inalámbricos', 'Pizarra digital'],
    icon: 'Target',
    color: '#3b82f6'
  },
  {
    id: 'gala',
    name: 'Cena de Gala',
    description: 'Experiencia gastronómica premium',
    isActive: true,
    maxCapacity: 450,
    minCapacity: 30,
    basePrice: 60,
    hourlyRate: 3000,
    minHours: 3,
    maxHours: 8,
    requiresSpecialSetup: true,
    specialRequirements: ['Mesa principal', 'Iluminación especial'],
    cateringOptions: ['Menú gourmet', 'Vinos selectos', 'Servicio de mesa', 'Chef personal'],
    decorationOptions: ['Flores premium', 'Cristalería fina', 'Mantelería de lujo', 'Centros de mesa elegantes'],
    audioVisualOptions: ['Música ambiental', 'Iluminación dramática', 'Sistema de audio discreto'],
    icon: 'Crown',
    color: '#f59e0b'
  },
  {
    id: 'privado',
    name: 'Evento Privado',
    description: 'Intimidad y exclusividad',
    isActive: true,
    maxCapacity: 450,
    minCapacity: 10,
    basePrice: 40,
    hourlyRate: 3000,
    minHours: 2,
    maxHours: 10,
    requiresSpecialSetup: false,
    specialRequirements: ['Configuración personalizada'],
    cateringOptions: ['Menú personalizado', 'Bebidas seleccionadas', 'Servicio discreto'],
    decorationOptions: ['Decoración personalizada', 'Ambiente íntimo'],
    audioVisualOptions: ['Música personalizada', 'Iluminación suave'],
    icon: 'Star',
    color: '#8b5cf6'
  },
  {
    id: 'cumpleanos',
    name: 'Cumpleaños',
    description: 'Celebración única y memorable',
    isActive: true,
    maxCapacity: 450,
    minCapacity: 15,
    basePrice: 30,
    hourlyRate: 3000,
    minHours: 3,
    maxHours: 8,
    requiresSpecialSetup: true,
    specialRequirements: ['Mesa de pastel', 'Decoración temática'],
    cateringOptions: ['Pastel personalizado', 'Refrigerios', 'Bebidas', 'Snacks'],
    decorationOptions: ['Decoración temática', 'Globos', 'Banderas', 'Centros de mesa'],
    audioVisualOptions: ['Música animada', 'Iluminación festiva', 'Proyector para fotos'],
    icon: 'Gift',
    color: '#10b981'
  },
  {
    id: 'aniversario',
    name: 'Aniversario',
    description: 'Renueva tus promesas',
    isActive: true,
    maxCapacity: 450,
    minCapacity: 20,
    basePrice: 35,
    hourlyRate: 3000,
    minHours: 3,
    maxHours: 8,
    requiresSpecialSetup: true,
    specialRequirements: ['Mesa romántica', 'Decoración especial'],
    cateringOptions: ['Menú romántico', 'Vino espumante', 'Pastel especial'],
    decorationOptions: ['Flores románticas', 'Velas', 'Mantelería elegante'],
    audioVisualOptions: ['Música romántica', 'Iluminación suave', 'Proyector para fotos'],
    icon: 'Star',
    color: '#ec4899'
  }
];

// Configuración por defecto de eventos de despechos
export const defaultDespechosEvents: DespechosEventConfig[] = [
  {
    id: 'despecho-visita-corta',
    name: 'Visita Corta - Desahogo Rápido',
    description: 'Perfecto para una o dos bebidas y cantar un par de canciones',
    isActive: true,
    maxCapacity: 8,
    minCapacity: 1,
    coverPrice: 150,
    minHours: 0.5,
    maxHours: 1,
    requiresSpecialSetup: false,
    specialRequirements: ['Mesa básica', 'Acceso a karaoke'],
    cateringOptions: ['Cover de entrada', 'Bebidas por separado', 'Snacks básicos'],
    decorationOptions: ['Ambiente de despecho', 'Música temática'],
    audioVisualOptions: ['Karaoke', 'Música de fondo', 'Iluminación básica'],
    icon: 'Users',
    color: '#ef4444',
    additionalCosts: 0
  },
  {
    id: 'despecho-promedio',
    name: 'Visita Promedio - Noche Estándar',
    description: 'Experiencia completa de despecho con tiempo para disfrutar',
    isActive: true,
    maxCapacity: 12,
    minCapacity: 2,
    coverPrice: 250,
    minHours: 1.5,
    maxHours: 2.5,
    requiresSpecialSetup: false,
    specialRequirements: ['Mesa reservada', 'Karaoke ilimitado'],
    cateringOptions: ['Cover de entrada', 'Bebidas incluidas (limitadas)', 'Botanas'],
    decorationOptions: ['Ambiente temático', 'Accesorios de despecho'],
    audioVisualOptions: ['Karaoke profesional', 'Música personalizada', 'Iluminación ambiental'],
    icon: 'Music',
    color: '#3b82f6',
    additionalCosts: 0
  },
  {
    id: 'despecho-visita-larga',
    name: 'Visita Larga - Noche Completa',
    description: 'Noche completa de despecho con karaoke, música en vivo y grupos de amigos',
    isActive: true,
    maxCapacity: 15,
    minCapacity: 4,
    coverPrice: 400,
    minHours: 3,
    maxHours: 4,
    requiresSpecialSetup: true,
    specialRequirements: ['Mesa VIP', 'Karaoke privado', 'Área reservada'],
    cateringOptions: ['Cover premium', 'Bebidas incluidas (generosas)', 'Botanas premium'],
    decorationOptions: ['Decoración completa', 'Ambiente VIP', 'Accesorios especiales'],
    audioVisualOptions: ['Karaoke profesional', 'Música en vivo', 'Iluminación especial', 'Efectos de sonido'],
    icon: 'Crown',
    color: '#f59e0b',
    additionalCosts: 200
  },
  {
    id: 'despecho-evento-especial',
    name: 'Evento Especial - Show de Despecho',
    description: 'Aniversarios, rupturas recientes, shows especiales - La experiencia definitiva',
    isActive: true,
    maxCapacity: 20,
    minCapacity: 6,
    coverPrice: 600,
    minHours: 4,
    maxHours: 6,
    requiresSpecialSetup: true,
    specialRequirements: ['Salón privado', 'Show personalizado', 'Staff dedicado'],
    cateringOptions: ['Cover VIP', 'Barra libre', 'Menú especial de despecho'],
    decorationOptions: ['Decoración temática completa', 'Ambiente de show', 'Accesorios premium'],
    audioVisualOptions: ['Sistema profesional', 'Show en vivo', 'Efectos especiales', 'Iluminación de espectáculo'],
    icon: 'Sparkles',
    color: '#8b5cf6',
    additionalCosts: 500
  }
];

// Funciones para manejar configuración en localStorage
export const getCapacityConfig = (): CapacityConfig => {
  if (typeof window === 'undefined') return defaultCapacityConfig;
  
  const stored = localStorage.getItem('marlett-capacity-config');
  if (stored) {
    try {
      return { ...defaultCapacityConfig, ...JSON.parse(stored) };
    } catch {
      return defaultCapacityConfig;
    }
  }
  return defaultCapacityConfig;
};

export const updateCapacityConfig = (config: Partial<CapacityConfig>): void => {
  if (typeof window === 'undefined') return;
  
  const current = getCapacityConfig();
  const updated = { ...current, ...config };
  localStorage.setItem('marlett-capacity-config', JSON.stringify(updated));
};

export const getEventTypesConfig = (): EventTypeConfig[] => {
  if (typeof window === 'undefined') return defaultEventTypes;
  
  const stored = localStorage.getItem('marlett-event-types-config');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultEventTypes;
    }
  }
  return defaultEventTypes;
};

export const updateEventTypesConfig = (events: EventTypeConfig[]): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('marlett-event-types-config', JSON.stringify(events));
};

export const getDespechosEventsConfig = (): DespechosEventConfig[] => {
  if (typeof window === 'undefined') return defaultDespechosEvents;
  
  const stored = localStorage.getItem('marlett-despechos-events-config');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultDespechosEvents;
    }
  }
  return defaultDespechosEvents;
};

export const updateDespechosEventsConfig = (events: DespechosEventConfig[]): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('marlett-despechos-events-config', JSON.stringify(events));
};

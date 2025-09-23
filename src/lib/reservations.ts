// Sistema de datos compartido para reservas y configuración de precios

export interface PricingConfig {
  salones: number;
  catering: number;
  decoracion: number;
  audioVisual: number;
  setup: number;
  hourlyRate: number;
}

// Configuración de precios por defecto
export const defaultPricing: PricingConfig = {
  salones: 900,
  catering: 15, // por persona
  decoracion: 8, // por persona
  audioVisual: 5, // por persona
  setup: 200,
  hourlyRate: 3000
};
export interface Reservation {
  id: string;
  ownerId?: string;
  isAnonymous?: boolean;
  name: string;
  email: string;
  phone: string;
  realName?: string;
  realEmail?: string;
  realPhone?: string;
  date: string;
  time: string;
  duration: number;
  eventType: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'in-progress' | 'completed';
  guests: number;
  rooms: string[];
  totalPrice: number;
  priceBreakdown: {
    basePrice: number;
    hourlyRate: number;
    roomCost: number;
    cateringCost: number;
    decorationCost: number;
    audioVisualCost: number;
    specialSetupCost: number;
  };
  cateringSelection: string[];
  decorationSelection: string[];
  audioVisualSelection: string[];
  notes: string[];
  avatar: string;
  createdAt: string;
}

// Datos iniciales de reservas
export const initialReservations: Reservation[] = [
  {
    id: '1',
    name: 'María González',
    email: 'maria@email.com',
    phone: '+34 612 345 678',
    eventType: 'Boda y Celebración',
    date: '14/12/2024',
    time: '20:00',
    guests: 120,
    duration: 6,
    totalPrice: 25400,
    status: 'confirmed',
    rooms: ['room1', 'room2'],
    cateringSelection: ['Menú premium', 'Barra libre premium'],
    decorationSelection: ['Decoración especial en dorado'],
    audioVisualSelection: ['Música en vivo', 'Iluminación especial'],
    notes: ['Decoración especial en dorado', 'Música en vivo'],
    avatar: 'MG',
    createdAt: '2024-11-15',
    priceBreakdown: {
      basePrice: 5400,
      hourlyRate: 18000,
      roomCost: 1500,
      cateringCost: 1800,
      decorationCost: 960,
      audioVisualCost: 600,
      specialSetupCost: 200
    }
  },
  {
    id: '2',
    name: 'Carlos Empresario',
    email: 'carlos@empresa.com',
    phone: '+34 987 654 321',
    eventType: 'Evento Corporativo',
    date: '20/12/2024',
    time: '09:00',
    guests: 80,
    duration: 4,
    totalPrice: 16900,
    status: 'pending',
    rooms: ['room1'],
    cateringSelection: ['Coffee break', 'Almuerzo ejecutivo'],
    decorationSelection: ['Branding corporativo'],
    audioVisualSelection: ['Proyector HD', 'Sistema de audio'],
    notes: ['Necesita confirmación de asistentes'],
    avatar: 'CE',
    createdAt: '2024-11-18',
    priceBreakdown: {
      basePrice: 2800,
      hourlyRate: 12000,
      roomCost: 900,
      cateringCost: 1200,
      decorationCost: 640,
      audioVisualCost: 400,
      specialSetupCost: 0
    }
  },
  // Evento pasado para demostrar el historial en admin
  {
    id: '3',
    name: 'Ana Pérez',
    email: 'ana@email.com',
    phone: '+34 555 123 456',
    eventType: 'Cumpleaños',
    date: '05/09/2024', // Fecha pasada
    time: '15:00',
    guests: 50,
    duration: 4,
    totalPrice: 8500,
    status: 'completed', // Evento finalizado
    rooms: ['room1'],
    cateringSelection: ['Menú familiar'],
    decorationSelection: ['Decoración temática'],
    audioVisualSelection: ['Música ambiental'],
    notes: ['Evento familiar'],
    avatar: 'AP',
    createdAt: '2024-08-20',
    priceBreakdown: {
      basePrice: 1500,
      hourlyRate: 6000,
      roomCost: 600,
      cateringCost: 750,
      decorationCost: 400,
      audioVisualCost: 200,
      specialSetupCost: 50
    }
  }
];

// Funciones utilitarias
export const getActiveReservations = (reservations: Reservation[]) => {
  const today = new Date();
  return reservations.filter(reservation => {
    const [day, month, year] = reservation.date.split('/');
    const eventDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return eventDate >= today || reservation.status === 'in-progress';
  });
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-gradient-to-r from-green-700 to-green-800 text-white shadow-lg';
    case 'pending':
      return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg';
    case 'cancelled':
      return 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg';
    case 'in-progress':
      return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg';
    case 'completed':
      return 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg';
    default:
      return 'bg-gradient-to-r from-stone-600 to-stone-700 text-white shadow-lg';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'Confirmado';
    case 'pending':
      return 'Pendiente';
    case 'cancelled':
      return 'Cancelado';
    case 'in-progress':
      return 'En Proceso';
    case 'completed':
      return 'Finalizado';
    default:
      return 'Desconocido';
  }
};

// Simulación de almacenamiento local (en una aplicación real usarías una base de datos)
export const getReservations = (): Reservation[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('marlett-reservations');
    return stored ? JSON.parse(stored) : initialReservations;
  }
  return initialReservations;
};

export const saveReservations = (reservations: Reservation[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('marlett-reservations', JSON.stringify(reservations));
  }
};

export const addReservation = (reservation: Reservation): void => {
  const reservations = getReservations();
  reservations.push(reservation);
  saveReservations(reservations);
};

export const updateReservation = (id: string, updates: Partial<Reservation>): void => {
  const reservations = getReservations();
  const index = reservations.findIndex(r => r.id === id);
  if (index !== -1) {
    reservations[index] = { ...reservations[index], ...updates };
    saveReservations(reservations);
  }
};

export const deleteReservation = (id: string): void => {
  const reservations = getReservations();
  const filtered = reservations.filter(r => r.id !== id);
  saveReservations(filtered);
};

// Funciones para manejar configuración de precios
export const getPricingConfig = (): PricingConfig => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('marlett-pricing-config');
    return stored ? JSON.parse(stored) : defaultPricing;
  }
  return defaultPricing;
};

export const savePricingConfig = (config: PricingConfig): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('marlett-pricing-config', JSON.stringify(config));
  }
};

export const updatePricingConfig = (updates: Partial<PricingConfig>): void => {
  const currentConfig = getPricingConfig();
  const newConfig = { ...currentConfig, ...updates };
  savePricingConfig(newConfig);
};

// --- Supabase integration (optional) ---
import { supabase } from './supabase';

type Json = Record<string, any> | any[] | string | number | boolean | null;

function toSnakeCaseReservation(reservation: Reservation): Record<string, Json> {
  return {
    id: reservation.id,
    owner_id: reservation.ownerId ?? null,
    is_anonymous: reservation.isAnonymous ?? null,
    name: reservation.name,
    email: reservation.email,
    phone: reservation.phone,
    real_name: reservation.realName ?? null,
    real_email: reservation.realEmail ?? null,
    real_phone: reservation.realPhone ?? null,
    date: reservation.date,
    time: reservation.time,
    duration: reservation.duration,
    event_type: reservation.eventType,
    status: reservation.status,
    guests: reservation.guests,
    rooms: reservation.rooms,
    total_price: reservation.totalPrice,
    price_breakdown: reservation.priceBreakdown as unknown as Json,
    catering_selection: reservation.cateringSelection,
    decoration_selection: reservation.decorationSelection,
    audiovisual_selection: reservation.audioVisualSelection,
    notes: reservation.notes,
    avatar: reservation.avatar,
    created_at: reservation.createdAt,
  };
}

function fromSnakeCaseReservation(row: any): Reservation {
  return {
    id: String(row.id),
    ownerId: row.owner_id ?? row.ownerId,
    isAnonymous: row.is_anonymous ?? row.isAnonymous,
    name: row.name,
    email: row.email,
    phone: row.phone,
    realName: row.real_name ?? row.realName,
    realEmail: row.real_email ?? row.realEmail,
    realPhone: row.real_phone ?? row.realPhone,
    date: row.date,
    time: row.time,
    duration: row.duration,
    eventType: row.event_type ?? row.eventType,
    status: row.status,
    guests: row.guests,
    rooms: row.rooms ?? [],
    totalPrice: row.total_price ?? row.totalPrice,
    priceBreakdown: row.price_breakdown ?? row.priceBreakdown,
    cateringSelection: row.catering_selection ?? [],
    decorationSelection: row.decoration_selection ?? [],
    audioVisualSelection: row.audiovisual_selection ?? row.audioVisualSelection ?? [],
    notes: row.notes ?? [],
    avatar: row.avatar ?? '',
    createdAt: row.created_at ?? row.createdAt,
  } as Reservation;
}

export async function fetchReservationsAsync(): Promise<Reservation[]> {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return getReservations();
    return data.map(fromSnakeCaseReservation);
  } catch {
    return getReservations();
  }
}

// Joined fetch with clients and events (if corresponding tables exist)
export interface ReservationJoined extends Reservation {
  client?: { id: string; name: string; email: string; phone: string } | null
  event?: { id: string; name: string; date: string; place?: string; description?: string } | null
}

export async function fetchReservationsWithRelationsAsync(): Promise<ReservationJoined[]> {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        clients:clientes(id,name:nombre,email:correo,phone:telefono),
        events:eventos(id,name:nombre,date:fecha,place:lugar,description:descripcion)
      `)
      .order('created_at', { ascending: false })
    if (error || !data) {
      return (await fetchReservationsAsync()).map(r => ({ ...r, client: null, event: null }))
    }
    return data.map((row: any) => {
      const base = fromSnakeCaseReservation(row)
      return {
        ...base,
        client: row.clients ? {
          id: String(row.clients.id),
          name: row.clients.name,
          email: row.clients.email,
          phone: row.clients.phone,
        } : null,
        event: row.events ? {
          id: String(row.events.id),
          name: row.events.name,
          date: row.events.date,
          place: row.events.place,
          description: row.events.description,
        } : null,
      } as ReservationJoined
    })
  } catch {
    return (await fetchReservationsAsync()).map(r => ({ ...r, client: null, event: null }))
  }
}

export async function insertReservationAsync(reservation: Reservation): Promise<void> {
  try {
    const payload = toSnakeCaseReservation(reservation);
    const { error } = await supabase.from('reservations').insert(payload);
    if (error) throw error;
  } catch {
    addReservation(reservation);
  }
}

export async function updateReservationAsync(id: string, updates: Partial<Reservation>): Promise<void> {
  try {
    const payload = toSnakeCaseReservation({
      // Provide defaults while converting
      ...(getReservations().find(r => r.id === id) as Reservation),
      ...updates,
    });
    // Avoid sending id in update payload on Supabase
    delete (payload as any).id;
    const { error } = await supabase.from('reservations').update(payload).eq('id', id);
    if (error) throw error;
  } catch {
    updateReservation(id, updates);
  }
}

export async function deleteReservationAsync(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (error) throw error;
  } catch {
    deleteReservation(id);
  }
}

export async function getPricingConfigAsync(): Promise<PricingConfig> {
  try {
    const { data, error } = await supabase.from('pricing_config').select('*').limit(1).maybeSingle();
    if (error || !data) return getPricingConfig();
    return {
      salones: data.salones ?? defaultPricing.salones,
      catering: data.catering ?? defaultPricing.catering,
      decoracion: data.decoracion ?? defaultPricing.decoracion,
      audioVisual: data.audio_visual ?? data.audioVisual ?? defaultPricing.audioVisual,
      setup: data.setup ?? defaultPricing.setup,
      hourlyRate: data.hourly_rate ?? defaultPricing.hourlyRate,
    } as PricingConfig;
  } catch {
    return getPricingConfig();
  }
}

export async function updatePricingConfigAsync(config: Partial<PricingConfig>): Promise<void> {
  try {
    const merged = { ...getPricingConfig(), ...config };
    const payload = {
      id: 1,
      salones: merged.salones,
      catering: merged.catering,
      decoracion: merged.decoracion,
      audio_visual: merged.audioVisual,
      setup: merged.setup,
      hourly_rate: merged.hourlyRate,
    };
    const { error } = await supabase.from('pricing_config').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  } catch {
    updatePricingConfig(config);
  }
}

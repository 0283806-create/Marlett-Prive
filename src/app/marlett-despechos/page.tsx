'use client';

import { useState, useEffect } from 'react';
import { 
  getReservations, 
  saveReservations, 
  addReservation, 
  updateReservation,
  getActiveReservations,
  getStatusColor,
  getStatusText,
  getPricingConfig,
  type Reservation,
  type PricingConfig 
} from '@/lib/reservations';
import { 
  getDespechosEventsConfig,
  getCapacityConfig,
  getIndividualCapacityConfig,
  type DespechosEventConfig 
} from '@/lib/system-config';
import { 
  containsInappropriateContent, 
  isValidEventType, 
  sanitizeText, 
  getInappropriateContentMessage 
} from '@/lib/profanity-filter';
import { sanitizePersonNameLive } from '@/lib/utils'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Heart, 
  Target, 
  Crown, 
  Star, 
  Gift, 
  Star as StarOutline,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  Eye,
  Download,
  X,
  Check,
  Info,
  Calculator,
  Merge,
  TreePine,
  Leaf,
  Image,
  Camera,
  Eye as EyeIcon,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ArrowLeft,
  Music,
  Zap,
  Sparkles
} from 'lucide-react';

import { downloadReservationPdf } from '@/lib/utils'
import DownloadPDF from '@/components/DownloadPDF'

interface EventType {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  basePricePerPerson: number;
  hourlyRate: number;
  minCapacity: number;
  maxCapacity: number;
  minHours: number;
  maxHours: number;
  requiresSpecialSetup: boolean;
  specialRequirements: string[];
  cateringOptions: string[];
  decorationOptions: string[];
  audioVisualOptions: string[];
}

export default function MarlettDespechosPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    salones: 0,
    hourlyRate: 0,
    catering: 0,
    decoracion: 0,
    audioVisual: 0,
    setup: 0
  });

  useEffect(() => {
    const loadData = async () => {
      const [reservationsData, pricingData] = await Promise.all([
        getReservations(),
        getPricingConfig()
      ]);
      setReservations(reservationsData);
      setPricingConfig(pricingData);
    };
    loadData();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    time: '',
    guests: '',
    duration: ''
  });

  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [customEventType, setCustomEventType] = useState('');
  const [customEventError, setCustomEventError] = useState('');
  const [notes, setNotes] = useState<string[]>(['']);
  const [selectedRooms, setSelectedRooms] = useState<string[]>(['room1']);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Eventos específicos para Marlett de Despechos
  const [despechosEventTypes, setDespechosEventTypes] = useState<EventType[]>([]);
  const [capacityConfig, setCapacityConfig] = useState(getCapacityConfig());
  const [individualCapacityConfig, setIndividualCapacityConfig] = useState(getIndividualCapacityConfig());

  // Cargar configuración dinámica de eventos de despechos
  useEffect(() => {
    const loadDespechosEventTypes = () => {
      const config = getDespechosEventsConfig();
      const iconMap: Record<string, React.ReactNode> = {
        Heart: <Heart className="w-8 h-8" />,
        Target: <Target className="w-8 h-8" />,
        Crown: <Crown className="w-8 h-8" />,
        Star: <Star className="w-8 h-8" />,
        Gift: <Gift className="w-8 h-8" />,
        Users: <Users className="w-8 h-8" />,
        Music: <Music className="w-8 h-8" />,
        Sparkles: <Sparkles className="w-8 h-8" />,
      };

      const mappedEvents = config.map(eventConfig => ({
        ...eventConfig,
        icon: iconMap[eventConfig.icon] || <Users className="w-8 h-8" />,
        basePricePerPerson: 0, // Solo cover
        hourlyRate: 0 // No cobro por hora
      }));
      
      setDespechosEventTypes(mappedEvents);
    };

    loadDespechosEventTypes();
    setCapacityConfig(getCapacityConfig());
    setIndividualCapacityConfig(getIndividualCapacityConfig());
  }, []);

  // Imágenes específicas para despechos
  const despechosImages = [
    {
      url: '/Copia de PHOTO-2025-07-09-20-40-28.jpg',
      title: 'Área de Fiesta',
      description: 'Espacio perfecto para celebraciones'
    },
    {
      url: '/Copia de PHOTO-2025-07-14-16-08-57 2.jpg',
      title: 'Salón Principal',
      description: 'Espacio principal con mesas y decoración sofisticada'
    },
    {
      url: '/Copia de PHOTO-2025-07-14-16-08-57 3.jpg',
      title: 'Área de Comedor',
      description: 'Comedor principal con diseño contemporáneo'
    },
    {
      url: '/Copia de PHOTO-2025-07-14-16-08-57 4.jpg',
      title: 'Vista Interior',
      description: 'Perspectiva interior del restaurante'
    },
    {
      url: '/Copia de PHOTO-2025-07-14-16-08-57 5.jpg',
      title: 'Ambiente Elegante',
      description: 'Espacio con iluminación y decoración premium'
    },
    {
      url: '/Copia de PHOTO-2025-07-14-16-09-46 2.jpg',
      title: 'Salón de Eventos',
      description: 'Espacio para eventos con configuración flexible'
    },
    {
      url: '/Copia de PHOTO-2025-07-14-16-09-46 4.jpg',
      title: 'Área de Reuniones',
      description: 'Espacio íntimo para reuniones privadas'
    },
    {
      url: '/Copia de PHOTO-2025-07-14-16-09-46.jpg',
      title: 'Vista Panorámica',
      description: 'Vista completa del espacio interior'
    }
  ];

  // Navegación de galería con teclado
  useEffect(() => {
    if (!showGallery) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedImageIndex(prev => (prev > 0 ? prev - 1 : despechosImages.length - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedImageIndex(prev => (prev < despechosImages.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Escape') {
        setShowGallery(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGallery, despechosImages.length]);

  const calculatePrice = (eventType: EventType, guests: number, rooms: string[], duration: number) => {
    // Sistema de cover para despechos
    const coverPerPerson = getCoverPrice(eventType.id);
    const totalCover = coverPerPerson * guests;
    
    // Costos adicionales según el tipo de evento
    let additionalCosts = 0;
    if (eventType.id === 'despecho-evento-especial') {
      additionalCosts = 500; // Costo adicional por show personalizado
    } else if (eventType.id === 'despecho-visita-larga') {
      additionalCosts = 200; // Costo adicional por área VIP
    }

    const totalPrice = totalCover + additionalCosts;

    return {
      basePrice: totalCover,
      hourlyRate: 0, // No se cobra por hora
      roomCost: 0, // Incluido en el cover
      cateringCost: 0, // Incluido en el cover según el tipo
      decorationCost: 0, // Incluido en el cover
      audioVisualCost: 0, // Incluido en el cover
      specialSetupCost: additionalCosts,
      totalPrice
    };
  };

  const getCoverPrice = (eventTypeId: string): number => {
    switch (eventTypeId) {
      case 'despecho-visita-corta':
        return 150; // $150 MXN por persona
      case 'despecho-promedio':
        return 250; // $250 MXN por persona
      case 'despecho-visita-larga':
        return 400; // $400 MXN por persona
      case 'despecho-evento-especial':
        return 600; // $600 MXN por persona
      default:
        return 200;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!selectedEventType || !formData.name || !formData.email || !formData.phone || !selectedDate || !formData.time || !formData.guests || !formData.duration) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    // Validar contenido inapropiado en campos de texto
    if (!isAnonymous) {
      if (containsInappropriateContent(formData.name)) {
        alert('Contenido no permitido en el nombre. Usa un lenguaje apropiado.');
        return;
      }
    }
    
    // Validar que el tipo de evento seleccionado sea apropiado
    const selectedEvent = despechosEventTypes.find(e => e.id === selectedEventType);
    if (!selectedEvent) return;
    
    if (containsInappropriateContent(selectedEvent.name)) {
      alert('Tipo de evento no permitido. Selecciona un evento apropiado.');
      return;
    }

    const guests = parseInt(formData.guests);
    const duration = parseFloat(formData.duration);
    
    // Validar capacidad del evento
    if (guests < selectedEvent.minCapacity || guests > selectedEvent.maxCapacity) {
      alert(`El número de invitados debe estar entre ${selectedEvent.minCapacity} y ${selectedEvent.maxCapacity}.`);
      return;
    }

    // Validar límites globales de capacidad
    const maxGuestsForDespechos = individualCapacityConfig.despechosEvents.maxGuestsPerEvent;
    if (guests > maxGuestsForDespechos) {
      alert(`El número de invitados excede el límite máximo permitido para Marlett de Despechos de ${maxGuestsForDespechos} personas por evento.`);
      return;
    }

    if (duration < selectedEvent.minHours || duration > selectedEvent.maxHours) {
      alert(`La duración debe estar entre ${selectedEvent.minHours} y ${selectedEvent.maxHours} horas.`);
      return;
    }

    const priceBreakdown = calculatePrice(selectedEvent, guests, selectedRooms, duration);

    const newReservation: Reservation = {
      id: `despechos_${Date.now()}`,
      name: isAnonymous ? 'Evento Anónimo' : formData.name,
      email: formData.email,
      phone: formData.phone,
      eventType: selectedEvent.name,
      date: selectedDate.split('-').reverse().join('/'),
      time: formData.time,
      duration: duration,
      guests: guests,
      rooms: selectedRooms,
      totalPrice: priceBreakdown.totalPrice,
      priceBreakdown: priceBreakdown,
      status: 'pending',
      cateringSelection: selectedEvent.cateringOptions,
      decorationSelection: selectedEvent.decorationOptions,
      audioVisualSelection: selectedEvent.audioVisualOptions,
      notes: notes.filter(note => note.trim() !== ''),
      avatar: '/images/default-avatar.svg',
      realName: formData.name,
      createdAt: new Date().toLocaleString('es-ES'),
      isAnonymous: isAnonymous
    };

    try {
      await addReservation(newReservation);
      setReservations(prev => [...prev, newReservation]);
      
      // Limpiar formulario
      setFormData({
        name: '',
        email: '',
        phone: '',
        time: '',
        guests: '',
        duration: ''
      });
      setSelectedEventType('');
      setSelectedDate('');
      setIsAnonymous(false);
      setNotes(['']);
      setSelectedRooms(['room1']);
      
      alert('¡Reserva creada exitosamente! Te contactaremos pronto para confirmar los detalles.');
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      alert('Hubo un error al crear la reserva. Por favor intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      {/* Header Especial para Despechos */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-pink-700 to-red-600"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Marlett de Despechos
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              ¡La despedida de soltero/a más épica que jamás hayas vivido! 
              <br />
              <span className="text-yellow-300 font-semibold">Música, diversión y recuerdos inolvidables te esperan.</span>
            </p>

            <div className="flex justify-center gap-4 mb-8">
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Button>
              <Button
                onClick={() => setShowGallery(true)}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Image className="w-4 h-4 mr-2" />
                Ver Galería
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Panel Izquierdo - Nueva Reserva */}
          <div className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-700 to-pink-600 text-white p-8">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Sparkles className="w-8 h-8" />
                  ¡Reserva tu Despedida Épica!
                </CardTitle>
                <CardDescription className="text-white/90 text-lg">
                  Elige tu paquete y prepárate para la mejor noche de tu vida
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Tipos de Evento */}
                  <div>
                    <Label className="text-xl font-bold text-stone-800 mb-6 block flex items-center gap-3">
                      <Music className="w-6 h-6 text-purple-700" />
                      Selecciona tu Paquete de Despedida
                    </Label>
                    <div className="grid grid-cols-1 gap-4">
                      {despechosEventTypes.map((eventType) => (
                        <div
                          key={eventType.id}
                          onClick={() => setSelectedEventType(eventType.id)}
                          className={`group cursor-pointer transition-all duration-500 hover:scale-105 ${
                            selectedEventType === eventType.id
                              ? 'ring-4 ring-purple-500 ring-offset-4'
                              : 'hover:shadow-2xl'
                          }`}
                        >
                          <div className="bg-gradient-to-br from-purple-700 via-pink-600 to-red-500 rounded-2xl p-6 text-white transform transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <div className="bg-white/20 rounded-xl p-3">
                                  {eventType.icon}
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold">{eventType.name}</h3>
                                  <p className="text-white/90">{eventType.description}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold">${getCoverPrice(eventType.id).toLocaleString()}</div>
                                <div className="text-sm text-white/80">cover por persona</div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="space-y-1">
                                <p className="text-white/80">Capacidad: {eventType.minCapacity}-{eventType.maxCapacity} personas</p>
                                <p className="text-white/80">Duración: {eventType.minHours}-{eventType.maxHours} horas</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-white/80">Setup especial: {eventType.requiresSpecialSetup ? 'Sí' : 'No'}</p>
                                <p className="text-white/80">Requisitos: {eventType.specialRequirements.length}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Información del Cliente */}
                  <div className="space-y-6">
                    <Label className="text-xl font-bold text-stone-800 mb-6 block flex items-center gap-3">
                      <Users className="w-6 h-6 text-purple-700" />
                      Información del Organizador
                    </Label>
                    
                    {/* Checkbox de Anonimato */}
                    <div className={`flex items-center space-x-3 p-4 border rounded-xl transition-all duration-300 ${
                      isAnonymous 
                        ? 'bg-purple-50 border-purple-200' 
                        : 'bg-stone-50 border-stone-200'
                    }`}>
                      <input
                        type="checkbox"
                        id="anonymous-despechos"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-stone-300 rounded"
                      />
                      <Label htmlFor="anonymous-despechos" className="text-sm font-medium text-stone-700 cursor-pointer">
                        Modo Anónimo: Mantener privacidad del organizador
                      </Label>
                    </div>
                    
                    {isAnonymous && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-purple-800 text-sm">
                          <strong>Modo Anónimo:</strong> Tu información personal se mantendrá privada en la web, pero necesitamos tus datos para contactarte sobre el evento.
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="name-despechos" className="text-stone-700 font-semibold">
                          Nombre completo <span className="text-red-500">*</span>
                          {isAnonymous && <span className="text-purple-600 text-sm ml-2">(privado)</span>}
                        </Label>
                        <Input
                          id="name-despechos"
                          autoComplete="name"
                          inputMode="text"
                          value={formData.name}
                          onChange={(e) => {
                            const value = sanitizePersonNameLive(e.target.value);
                            setFormData(prev => ({...prev, name: value}));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.code === 'Space' || (e as any).key === 'Spacebar') {
                              const input = e.currentTarget as HTMLInputElement
                              const start = input.selectionStart ?? input.value.length
                              const end = input.selectionEnd ?? input.value.length
                              const next = input.value.slice(0, start) + ' ' + input.value.slice(end)
                              setFormData(prev => ({ ...prev, name: sanitizePersonNameLive(next) }))
                              e.preventDefault()
                              e.stopPropagation()
                              requestAnimationFrame(() => {
                                try { input.setSelectionRange(start + 1, start + 1) } catch {}
                              })
                            }
                          }}
                          onBlur={(e) => {
                            try {
                              const { formatPersonName } = require('@/lib/utils')
                              const formatted = formatPersonName(e.target.value)
                              setFormData(prev => ({ ...prev, name: formatted }))
                            } catch {}
                          }}
                          placeholder={isAnonymous ? "Tu nombre (se mantendrá privado)" : "Ingresa tu nombre"}
                          className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                          maxLength={50}
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="email-despechos" className="text-stone-700 font-semibold">
                          Email <span className="text-red-500">*</span>
                          {isAnonymous && <span className="text-purple-600 text-sm ml-2">(privado)</span>}
                        </Label>
                        <Input
                          id="email-despechos"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                          onBlur={(e) => setFormData(prev => ({ ...prev, email: e.target.value.trim() }))}
                          placeholder={isAnonymous ? "Tu email (se mantendrá privado)" : "tu@email.com"}
                          className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="phone-despechos" className="text-stone-700 font-semibold">
                        Teléfono <span className="text-red-500">*</span>
                        {isAnonymous && <span className="text-purple-600 text-sm ml-2">(privado)</span>}
                      </Label>
                      <Input
                        id="phone-despechos"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                        onBlur={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\s+/g, ' ').trim() }))}
                        placeholder={isAnonymous ? "Tu teléfono (se mantendrá privado)" : "+34 612 345 678"}
                        className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  {/* Fecha y Hora del Evento */}
                  <div className="space-y-6">
                    <Label className="text-xl font-bold text-stone-800 mb-6 block flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-purple-700" />
                      Fecha y Hora de tu Despecho
                    </Label>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="date-despechos" className="text-stone-700 font-semibold">
                          Fecha del Evento <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="date-despechos"
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="time-despechos" className="text-stone-700 font-semibold">
                          Hora de Inicio <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="time-despechos"
                          value={formData.time}
                          onChange={(e) => setFormData(prev => ({...prev, time: e.target.value}))}
                          className="h-12 w-full bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300 px-3"
                          required
                        >
                          <option value="">Selecciona hora</option>
                          <option value="19:00">7:00 PM</option>
                          <option value="19:30">7:30 PM</option>
                          <option value="20:00">8:00 PM</option>
                          <option value="20:30">8:30 PM</option>
                          <option value="21:00">9:00 PM</option>
                          <option value="21:30">9:30 PM</option>
                          <option value="22:00">10:00 PM</option>
                          <option value="22:30">10:30 PM</option>
                          <option value="23:00">11:00 PM</option>
                          <option value="23:30">11:30 PM</option>
                          <option value="00:00">12:00 AM</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-purple-800">Horarios Disponibles</span>
                      </div>
                      <p className="text-sm text-purple-700">
                        El salón de despechos está disponible de <strong>7:00 PM a 12:00 AM</strong>. 
                        Las reservas pueden extenderse hasta la 1:00 AM para eventos especiales.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="guests-despechos" className="text-stone-700 font-semibold">
                          Número de Personas <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="guests-despechos"
                          type="number"
                          value={formData.guests}
                          onChange={(e) => setFormData(prev => ({...prev, guests: e.target.value}))}
                          placeholder="4"
                          min="1"
                          max="20"
                          className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="duration-despechos" className="text-stone-700 font-semibold">
                          Duración Estimada <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="duration-despechos"
                          value={formData.duration}
                          onChange={(e) => setFormData(prev => ({...prev, duration: e.target.value}))}
                          className="h-12 w-full bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300 px-3"
                          required
                        >
                          <option value="">Selecciona duración</option>
                          <option value="0.5">30 minutos - Desahogo rápido</option>
                          <option value="1">1 hora - Visita corta</option>
                          <option value="1.5">1.5 horas - Promedio</option>
                          <option value="2">2 horas - Promedio</option>
                          <option value="2.5">2.5 horas - Promedio</option>
                          <option value="3">3 horas - Noche completa</option>
                          <option value="4">4 horas - Noche completa</option>
                          <option value="5">5 horas - Evento especial</option>
                          <option value="6">6 horas - Evento especial</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Zap className="w-5 h-5 text-pink-600" />
                        <span className="font-semibold text-pink-800">Tipos de Visita</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-pink-700">
                        <div>
                          <strong>🍹 Visitas cortas (30-60 min):</strong> Una o dos bebidas y cantar un par de canciones
                        </div>
                        <div>
                          <strong>🎤 Visitas largas (3-4 horas):</strong> Karaoke, música en vivo, grupos de amigos
                        </div>
                        <div>
                          <strong>📅 Eventos especiales (4-6 horas):</strong> Aniversarios, rupturas recientes, shows
                        </div>
                        <div>
                          <strong>⏰ Promedio general:</strong> Entre 1.5 y 2.5 horas
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Calculadora de Precios */}
                  {formData.guests && formData.duration && selectedEventType && (
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                      <h4 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        Cálculo del Cover
                      </h4>
                      {(() => {
                        const selectedEvent = despechosEventTypes.find(e => e.id === selectedEventType);
                        if (!selectedEvent) return null;
                        
                        const guests = parseInt(formData.guests);
                        const duration = parseFloat(formData.duration);
                        const pricing = calculatePrice(selectedEvent, guests, selectedRooms, duration);
                        const coverPerPerson = getCoverPrice(selectedEvent.id);
                        
                        return (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-purple-700">Cover por persona:</span>
                              <span className="font-semibold">${coverPerPerson.toLocaleString()} MXN</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-purple-700">Número de personas:</span>
                              <span className="font-semibold">{guests}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-purple-700">Subtotal cover:</span>
                              <span className="font-semibold">${pricing.basePrice.toLocaleString()} MXN</span>
                            </div>
                            {pricing.specialSetupCost > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-purple-700">Servicios especiales:</span>
                                <span className="font-semibold">${pricing.specialSetupCost.toLocaleString()} MXN</span>
                              </div>
                            )}
                            <hr className="border-purple-300" />
                            <div className="flex justify-between items-center text-lg">
                              <span className="font-bold text-purple-800">Total a Pagar:</span>
                              <span className="font-bold text-purple-800">${pricing.totalPrice.toLocaleString()} MXN</span>
                            </div>
                            <div className="bg-purple-100 rounded-lg p-3 mt-4">
                              <p className="text-sm text-purple-800">
                                <strong>¿Qué incluye el cover?</strong><br />
                                {selectedEvent.cateringOptions.join(', ')}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Notas Adicionales */}
                  <div className="space-y-6">
                    <Label className="text-xl font-bold text-stone-800 mb-6 block flex items-center gap-3">
                      <Zap className="w-6 h-6 text-purple-700" />
                      Notas Especiales para tu Despedida
                    </Label>
                    <div className="space-y-3">
                      {notes.map((note, index) => (
                        <div key={index} className="flex gap-3">
                          <Textarea
                            value={note}
                            onChange={(e) => {
                              const newNotes = [...notes];
                              newNotes[index] = e.target.value;
                              setNotes(newNotes);
                            }}
                            placeholder="Ej: Temática específica, alergias alimentarias, música preferida..."
                            className="flex-1 bg-stone-50 border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
                            rows={2}
                          />
                          {notes.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => {
                                const newNotes = notes.filter((_, i) => i !== index);
                                setNotes(newNotes);
                              }}
                              variant="outline"
                              size="sm"
                              className="mt-2"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={() => setNotes([...notes, ''])}
                        variant="outline"
                        className="w-full border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
                      >
                        + Agregar otra nota
                      </Button>
                    </div>
                  </div>

                  {/* Botón de Envío */}
                  <Button
                    type="submit"
                    className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Sparkles className="w-6 h-6 mr-2" />
                    ¡Reservar Mi Despedida Épica!
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Panel Derecho - Información */}
          <div className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-pink-600 to-red-500 text-white p-8">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Crown className="w-8 h-8" />
                  ¿Por qué elegir Marlett?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 rounded-full p-3">
                      <Music className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800 mb-2">Música y Entretenimiento</h3>
                      <p className="text-stone-600">Sistema de audio profesional y DJ en vivo para que la música no pare.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-pink-100 rounded-full p-3">
                      <Zap className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800 mb-2">Ambiente Único</h3>
                      <p className="text-stone-600">Espacios diseñados especialmente para crear momentos inolvidables.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-red-100 rounded-full p-3">
                      <Sparkles className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800 mb-2">Servicio Premium</h3>
                      <p className="text-stone-600">Personal especializado en hacer de tu despedida una experiencia única.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 rounded-full p-3">
                      <Crown className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800 mb-2">Flexibilidad Total</h3>
                      <p className="text-stone-600">Personalizamos cada detalle para que sea exactamente como lo sueñas.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <Info className="w-6 h-6" />
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-purple-600" />
                    <span className="text-stone-700">+52 (33) 1234-5678</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-purple-600" />
                    <span className="text-stone-700">despechos@marlett.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <span className="text-stone-700">Av. Principal 123, Guadalajara</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Galería Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-stone-200">
              <h2 className="text-2xl font-bold text-stone-800">Galería - Marlett de Despechos</h2>
              <Button
                onClick={() => setShowGallery(false)}
                variant="outline"
                size="sm"
                className="h-10 w-10 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="relative h-96 bg-stone-100 rounded-2xl overflow-hidden">
                <img 
                  src={despechosImages[selectedImageIndex]?.url} 
                  alt={despechosImages[selectedImageIndex]?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h3 className="text-xl font-semibold mb-2 text-white">{despechosImages[selectedImageIndex]?.title}</h3>
                  <p className="text-stone-200">{despechosImages[selectedImageIndex]?.description}</p>
                </div>
              </div>
              
              <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                <Button
                  onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : despechosImages.length - 1)}
                  variant="outline"
                  size="sm"
                  className="h-12 w-12 p-0 bg-white/90 hover:bg-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              </div>
              
              <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                <Button
                  onClick={() => setSelectedImageIndex(prev => prev < despechosImages.length - 1 ? prev + 1 : 0)}
                  variant="outline"
                  size="sm"
                  className="h-12 w-12 p-0 bg-white/90 hover:bg-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 p-6">
              {despechosImages.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative h-24 bg-stone-100 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    selectedImageIndex === index ? 'ring-4 ring-purple-500 scale-105' : 'hover:scale-105'
                  }`}
                >
                  <img 
                    src={image.url} 
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

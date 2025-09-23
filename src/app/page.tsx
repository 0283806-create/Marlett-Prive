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
  containsInappropriateContent, 
  isValidEventType, 
  sanitizeText, 
  getInappropriateContentMessage 
} from '@/lib/profanity-filter';
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
  DollarSign,
  FileText,
  Phone,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  Building2,
  Settings,
  Download,
  Plus,
  X,
  Check,
  Info,
  Calculator,
  Merge,
  TreePine,
  Leaf,
  Image,
  Camera,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

import { downloadReservationPdf } from '@/lib/utils'
import DownloadPDF from '@/components/DownloadPDF'

interface Room {
  id: string;
  name: string;
  capacity: number;
  basePrice: number;
  isActive: boolean;
  features: string[];
  image: string;
  description: string;
}

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

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'cortesia' | 'entrada-fria' | 'tostada' | 'ensalada' | 'entrada-caliente' | 'taco' | 'principal' | 'corte' | 'crema' | 'guarnicion' | 'pasta' | 'pizza' | 'hamburguesa' | 'postre';
  weight?: string;
  image?: string;
  allergens?: string[];
}

interface MenuPackage {
  id: string;
  name: string;
  description: string;
  courses: {
    entradas: MenuItem[];
    platosFuertes: MenuItem[];
    postres: MenuItem[];
  };
  pricePerPerson: number;
  minPeople: number;
}

interface BarPackage {
  id: string;
  name: string;
  description: string;
  duration: number; // horas
  pricePerPerson: number;
  includes: string[];
  restrictions?: string[];
}

interface CustomMenuItem {
  menuItemId: string;
  quantity: number;
}

interface CustomMenu {
  selectedItems: CustomMenuItem[];
  totalPerPerson: number;
}

// Interface Reservation importada desde @/lib/reservations

export default function MarlettReservations() {
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const [customEventType, setCustomEventType] = useState<string>('');
  const [customEventError, setCustomEventError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showRoomManager, setShowRoomManager] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedMenuPackage, setSelectedMenuPackage] = useState<string>('');
  const [selectedBarPackage, setSelectedBarPackage] = useState<string>('');
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [customMenu, setCustomMenu] = useState<CustomMenu>({ selectedItems: [], totalPerPerson: 0 });
  const [showCustomMenuBuilder, setShowCustomMenuBuilder] = useState(false);
  const [lastCreatedReservation, setLastCreatedReservation] = useState<Reservation | null>(null);
  const [reservationSaved, setReservationSaved] = useState(false);

  // Cargar reservas y configuración desde el sistema compartido
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    salones: 900,
    catering: 15,
    decoracion: 8,
    audioVisual: 5,
    setup: 200,
    hourlyRate: 3000
  });

  useEffect(() => {
    setReservations(getReservations());
    setPricingConfig(getPricingConfig());
  }, []);

  // Recargar configuración cada 5 segundos para reflejar cambios del admin
  useEffect(() => {
    const interval = setInterval(() => {
      setPricingConfig(getPricingConfig());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Función para marcar automáticamente eventos como "en proceso" el día del evento
  useEffect(() => {
    const updateEventStatus = () => {
      const today = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      setReservations(prev => 
        prev.map(reservation => {
          if (reservation.date === today && reservation.status === 'confirmed') {
            return { ...reservation, status: 'in-progress' as const };
          }
          return reservation;
        })
      );
    };

    // Verificar estados cada 30 minutos
    const interval = setInterval(updateEventStatus, 30 * 60 * 1000);
    updateEventStatus(); // Ejecutar inmediatamente
    
    return () => clearInterval(interval);
  }, []);
  
  // Navegación de galería con teclado (se reubica más abajo tras salonImages)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    time: '',
    guests: '',
    duration: ''
  });
  
  const [rooms] = useState<Room[]>([
    {
      id: 'room1',
      name: 'Salón Privado A',
      capacity: 80,
      basePrice: 800,
      isActive: true,
      features: ['Televisor HD', 'Sistema de sonido profesional', 'Iluminación LED'],
      image: '/salon-images/salon-eventos.svg',
      description: 'Salón privado con TV, luz y sonido integrados'
    },
    {
      id: 'room2',
      name: 'Salón Privado B',
      capacity: 80,
      basePrice: 700,
      isActive: true,
      features: ['Televisor HD', 'Sistema de sonido profesional', 'Iluminación LED'],
      image: '/salon-images/salon-eventos.svg',
      description: 'Salón privado con TV, luz y sonido integrados'
    },
    {
      id: 'room3',
      name: 'Salón Privado C',
      capacity: 80,
      basePrice: 600,
      isActive: true,
      features: ['Televisor HD', 'Sistema de sonido profesional', 'Iluminación LED'],
      image: '/salon-images/salon-eventos.svg',
      description: 'Salón privado con TV, luz y sonido integrados'
    },
    {
      id: 'room4',
      name: 'Salón Privado D',
      capacity: 80,
      basePrice: 900,
      isActive: true,
      features: ['Televisor HD', 'Sistema de sonido profesional', 'Proyector multimedia', 'Mobiliario premium'],
      image: '/salon-images/salon-ejecutivo.svg',
      description: 'Salón ejecutivo con vista panorámica y diseño moderno'
    }
  ]);

  const salonImages = [
    {
      url: '/marlett-images/recepcion-principal.jpg',
      title: 'Recepción Principal',
      description: 'Área de bienvenida con escaleras elegantes y diseño moderno'
    },
    {
      url: '/marlett-images/salon-eventos-1.jpg', 
      title: 'Salón de Eventos Premium',
      description: 'Espacio sofisticado con arcos arquitectónicos y mesas redondas'
    },
    {
      url: '/salon-images/salon-eventos.svg',
      title: 'Salón de Eventos', 
      description: 'Espacio flexible con mesas redondas y configuración premium'
    },
    {
      url: '/salon-images/salon-conferencias.svg',
      title: 'Salón de Conferencias',
      description: 'Configuración tipo auditorio con tecnología audiovisual'
    },
    {
      url: '/salon-images/salon-ejecutivo.svg',
      title: 'Salón Ejecutivo',
      description: 'Salón con vista panorámica y diseño moderno'
    },
    {
      url: '/salon-images/vista-aerea.svg',
      title: 'Vista Aérea',
      description: 'Perspectiva arquitectónica del complejo'
    },
    {
      url: '/salon-images/fachada-exterior.svg',
      title: 'Fachada Exterior',
      description: 'Vista externa del Restaurante Marlett con diseño contemporáneo'
    }
  ];

  // Navegación de galería con teclado (ubicada después de salonImages)
  useEffect(() => {
    if (!showGallery) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedImageIndex(prev => (prev > 0 ? prev - 1 : salonImages.length - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedImageIndex(prev => (prev < salonImages.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Escape') {
        setShowGallery(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGallery, salonImages.length]);

  // Menú Completo Marlett con Precios Reales
  const menuItems: MenuItem[] = [
    // Cortesías
    {
      id: 'cortesia-1',
      name: 'Focaccia de Romero y Olivo',
      description: 'Con mantequilla de rancho de pimientas con ajo',
      price: 0,
      category: 'cortesia'
    },
    {
      id: 'cortesia-2',
      name: 'Macha de Chile de Árbol',
      description: 'Árbol guajillo ajonjolí',
      price: 0,
      category: 'cortesia'
    },

    // Entradas Frías
    {
      id: 'entrada-fria-1',
      name: 'Aguachile Rojo Yahualica',
      description: 'Camarón, cebolla morada, jícama, chicharrón, limón, chiliflakes y aguacate',
      price: 220,
      weight: '200 gr',
      category: 'entrada-fria',
      allergens: ['mariscos']
    },
    {
      id: 'entrada-fria-2',
      name: 'Mariscos Campechana',
      description: 'Laminados, pulpo, atún, camarón cocido, salsa de carreta, cebolla morada',
      price: 290,
      weight: '300 gr',
      category: 'entrada-fria',
      allergens: ['mariscos']
    },
    {
      id: 'entrada-fria-3',
      name: 'Salmón Seul',
      description: 'Salsa Coreana agridulce, espinaca baby y ajo frito. Tostada loca',
      price: 220,
      weight: '200 gr',
      category: 'entrada-fria',
      allergens: ['pescado']
    },
    {
      id: 'entrada-fria-4',
      name: 'Carpaccio de Aguacate con Mariscos',
      description: 'Camarón cocido y pulpo, salsa cremosa de mayonesa limón y aceite de chiles, pimienta negra',
      price: 290,
      weight: '200 gr',
      category: 'entrada-fria',
      allergens: ['mariscos']
    },
    {
      id: 'entrada-fria-5',
      name: 'Carpaccio de Res',
      description: 'Alcaparras, aceite de olivo, arúgula, queso parmesano y mayonesa de pimientas. Pan de masa madre',
      price: 310,
      weight: '150 gr',
      category: 'entrada-fria',
      allergens: ['lácteos', 'gluten']
    },
    {
      id: 'entrada-fria-6',
      name: 'Sashimi de Atún',
      description: 'Salsa Ponzu IV, curtidos de habanero, aguacate, ensaladilla de rábanos',
      price: 310,
      weight: '150 gr',
      category: 'entrada-fria',
      allergens: ['pescado']
    },

    // Tostadas
    {
      id: 'tostada-1',
      name: 'La de Esquites Verdes',
      description: 'Espárragos, elote tierno, mayonesa de limón, polvo de chiles y queso seco',
      price: 160,
      category: 'tostada',
      allergens: ['lácteos']
    },
    {
      id: 'tostada-2',
      name: 'La de Marlín Ahumado',
      description: 'Sofrito casero, crema de rancho, cebollas moradas y habanero curtidas, cilantro',
      price: 145,
      category: 'tostada',
      allergens: ['pescado', 'lácteos']
    },
    {
      id: 'tostada-3',
      name: 'La Clásica de Atún',
      description: 'Ponzu IV, mayonesa de chipotle con ajo, aguacate, poro crispy',
      price: 175,
      category: 'tostada',
      allergens: ['pescado']
    },
    {
      id: 'tostada-4',
      name: 'La de Guacamole',
      description: 'Pico de gallo, panela y aceite de chiles',
      price: 125,
      category: 'tostada',
      allergens: ['lácteos']
    },

    // Ensaladas
    {
      id: 'ensalada-1',
      name: 'Iceberg',
      description: 'Lechuga romana bola, aderezo de queso azul, tocino crujiente y jitomates cherry. Crotón masa madre',
      price: 120,
      category: 'ensalada',
      allergens: ['lácteos', 'gluten']
    },
    {
      id: 'ensalada-2',
      name: 'César con Pollo',
      description: 'Lechuga Orejona, aderezo César "hecho en casa", queso Parmesano y pechuga de pollo a la parrilla. Crotón masa madre',
      price: 185,
      category: 'ensalada',
      allergens: ['lácteos', 'gluten']
    },
    {
      id: 'ensalada-3',
      name: 'Calabacitas Mixtas',
      description: 'Asadas al rescoldo, hojas mixtas, nuez, pistache, almendras, queso parmesano y limoneta de la casa',
      price: 110,
      category: 'ensalada',
      allergens: ['lácteos', 'frutos secos']
    },
    {
      id: 'ensalada-4',
      name: 'Ensalada Chef de los 80\'s',
      description: 'Lechugas mixtas y Carnes frías (salami, jamón de pavo, queso cheddar, pepperoni) aderezo Marlett',
      price: 145,
      category: 'ensalada',
      allergens: ['lácteos']
    },
    {
      id: 'ensalada-5',
      name: 'Jitomates Mixtos',
      description: 'Queso parmesano, ajo frito, vinagreta de limón, aceite de olivo, pesto de albahaca',
      price: 125,
      category: 'ensalada',
      allergens: ['lácteos']
    },
    {
      id: 'ensalada-6',
      name: 'Arúgula, Toronja y Apio',
      description: 'Vinagreta de limón, pistaches y queso parmesano',
      price: 125,
      category: 'ensalada',
      allergens: ['lácteos', 'frutos secos']
    },

    // Principales
    {
      id: 'principal-1',
      name: 'Salmón Alcaparrado',
      description: 'Salsa base de hierbas, mantequilla y alcaparras, puré de papa y hojas mixtas de la casa',
      price: 295,
      weight: '250 gr',
      category: 'principal',
      allergens: ['pescado', 'lácteos']
    },
    {
      id: 'principal-2',
      name: 'Salmón al Limón',
      description: 'Salsa cremosa con limón, puré de papa y hojas mixtas de la casa',
      price: 295,
      weight: '250 gr',
      category: 'principal',
      allergens: ['pescado', 'lácteos']
    },
    {
      id: 'principal-3',
      name: 'Atún Steak Sellado',
      description: 'Salsa de pimientas y jugo de carne, mix de fritos',
      price: 320,
      weight: '250 gr',
      category: 'principal',
      allergens: ['pescado']
    },
    {
      id: 'principal-4',
      name: 'Costilla Braseada',
      description: 'Cocción lenta al horno, 1 kg servida con hueso, demiglace de vino tinto y puré de papa trufado',
      price: 1320,
      weight: '1 kg',
      category: 'principal',
      allergens: ['lácteos']
    },
    {
      id: 'principal-5',
      name: '¼ de Lechón',
      description: 'Servido sin hueso, piel crujiente, puré de papa gratinado, cebolla curtida. Tortillas de Maíz',
      price: 590,
      weight: '350 gr',
      category: 'principal',
      allergens: ['lácteos']
    },
    {
      id: 'principal-6',
      name: 'Pulpo a las Brasas',
      description: 'Adobo rojo, al horno de brasa, papitas cambray y plátano macho a la mantequilla',
      price: 420,
      weight: '250 gr',
      category: 'principal',
      allergens: ['mariscos', 'lácteos']
    },
    {
      id: 'principal-7',
      name: 'Pollito con Papas Rostizado',
      description: '½ Pollito Rostizado, al horno de brasa, papas cambray, salsa caribeña y aioli de limón',
      price: 295,
      weight: '700 gr',
      category: 'principal'
    },
    {
      id: 'principal-8',
      name: 'Pechuga de Pollo',
      description: 'Asada natural al horno de brasa, vegetales verdes y hojas mixtas de casa',
      price: 220,
      weight: '200 gr',
      category: 'principal'
    },

    // Cortes al Josper
    {
      id: 'corte-1',
      name: 'Rib Eye',
      description: 'Todos los cortes se sirven con ensalada de la casa y chiles toreados',
      price: 980,
      weight: '500 kg',
      category: 'corte'
    },
    {
      id: 'corte-2',
      name: 'Vacío',
      description: 'Todos los cortes se sirven con ensalada de la casa y chiles toreados',
      price: 400,
      weight: '300 gr',
      category: 'corte'
    },
    {
      id: 'corte-3',
      name: 'Arrachera',
      description: 'Todos los cortes se sirven con ensalada de la casa y chiles toreados',
      price: 400,
      weight: '300 gr',
      category: 'corte'
    },
    {
      id: 'corte-4',
      name: 'Filete de Res',
      description: 'Todos los cortes se sirven con ensalada de la casa y chiles toreados',
      price: 450,
      weight: '250 gr',
      category: 'corte'
    },
    {
      id: 'corte-5',
      name: 'Cowboy Steak',
      description: 'Importado: Calidad High Choice. Todos los cortes se sirven con ensalada de la casa y chiles toreados',
      price: 1250,
      weight: '700 kg',
      category: 'corte'
    },

    // Postres
    {
      id: 'postre-1',
      name: 'Volcán de Cajeta',
      description: 'Con helado de vainilla. "25 min de preparación"',
      price: 140,
      category: 'postre',
      allergens: ['lácteos', 'huevo']
    },
    {
      id: 'postre-2',
      name: 'Churros de Mercado',
      description: 'Salsa de cajeta, salsa de lechera',
      price: 90,
      category: 'postre',
      allergens: ['lácteos', 'gluten']
    },
    {
      id: 'postre-3',
      name: 'Crumble de Frutos Rojos',
      description: 'Sarteneta terminada al horno de brasa, con helado de Vainilla. Para compartir',
      price: 140,
      category: 'postre',
      allergens: ['lácteos', 'gluten']
    },
    {
      id: 'postre-4',
      name: 'Crème Brûlée',
      description: 'Para compartir. De Vainilla',
      price: 190,
      category: 'postre',
      allergens: ['lácteos', 'huevo']
    },
    {
      id: 'postre-5',
      name: 'Tiramisú',
      description: 'Para compartir',
      price: 170,
      category: 'postre',
      allergens: ['lácteos', 'huevo', 'gluten']
    }
  ];

  const menuPackages: MenuPackage[] = [
    {
      id: 'package-1',
      name: 'Menú Ejecutivo',
      description: 'Perfecto para eventos corporativos (3 tiempos)',
      courses: {
        entradas: [
          menuItems.find(item => item.id === 'cortesia-1')!,
          menuItems.find(item => item.id === 'ensalada-2')! // César con Pollo $185
        ],
        platosFuertes: [
          menuItems.find(item => item.id === 'principal-8')! // Pechuga de Pollo $220
        ],
        postres: [
          menuItems.find(item => item.id === 'postre-2')! // Churros $90
        ]
      },
      pricePerPerson: 495, // $185 + $220 + $90 = $495 por persona
      minPeople: 20
    },
    {
      id: 'package-2', 
      name: 'Menú Premium',
      description: 'Experiencia gastronómica completa (3 tiempos)',
      courses: {
        entradas: [
          menuItems.find(item => item.id === 'cortesia-1')!,
          menuItems.find(item => item.id === 'entrada-fria-5')! // Carpaccio de Res $310
        ],
        platosFuertes: [
          menuItems.find(item => item.id === 'principal-1')! // Salmón Alcaparrado $295
        ],
        postres: [
          menuItems.find(item => item.id === 'postre-5')! // Tiramisú $170
        ]
      },
      pricePerPerson: 775, // $310 + $295 + $170 = $775 por persona
      minPeople: 25
    },
    {
      id: 'package-3',
      name: 'Menú Degustación',
      description: 'Selección premium del chef (4 tiempos)',
      courses: {
        entradas: [
          menuItems.find(item => item.id === 'cortesia-1')!,
          menuItems.find(item => item.id === 'entrada-fria-6')!, // Sashimi de Atún $310
          menuItems.find(item => item.id === 'entrada-fria-1')! // Aguachile $220
        ],
        platosFuertes: [
          menuItems.find(item => item.id === 'principal-6')! // Pulpo a las Brasas $420
        ],
        postres: [
          menuItems.find(item => item.id === 'postre-4')! // Crème Brûlée $190
        ]
      },
      pricePerPerson: 1140, // $310 + $220 + $420 + $190 = $1140 por persona
      minPeople: 15
    },
    {
      id: 'package-custom',
      name: 'Menú Personalizado',
      description: 'Diseña tu propio menú seleccionando platillos individuales',
      courses: {
        entradas: [],
        platosFuertes: [],
        postres: []
      },
      pricePerPerson: 0, // Se calcula dinámicamente
      minPeople: 10
    }
  ];

  const barPackages: BarPackage[] = [
    {
      id: 'bar-1',
      name: 'Barra Nacional',
      description: 'Selección de bebidas nacionales y cocteles clásicos',
      duration: 4,
      pricePerPerson: 380,
      includes: [
        'Tequila premium nacional',
        'Ron, vodka y whisky estándar',
        'Cerveza nacional',
        'Vinos de casa (tinto y blanco)',
        'Refrescos y jugos naturales',
        'Agua mineral',
        'Cocteles clásicos (Margarita, Mojito, Daiquiri)',
        'Servicio de barman profesional'
      ],
      restrictions: ['No se permite el ingreso de bebidas externas']
    },
    {
      id: 'bar-2',
      name: 'Barra Premium',
      description: 'Selección premium con marcas reconocidas y cocteles de autor',
      duration: 5,
      pricePerPerson: 580,
      includes: [
        'Tequila y mezcal premium',
        'Ron, vodka, whisky y gin premium',
        'Cerveza artesanal y de importación',
        'Vinos premium (selección del sommelier)',
        'Champagne y espumosos',
        'Licores especiales',
        'Cocteles de autor',
        'Servicio de barman especializado',
        'Estación de café gourmet'
      ],
      restrictions: ['No se permite el ingreso de bebidas externas', 'Servicio mínimo 4 horas']
    },
    {
      id: 'bar-3',
      name: 'Barra de Vinos',
      description: 'Experiencia enológica con maridaje incluido',
      duration: 3,
      pricePerPerson: 450,
      includes: [
        'Selección de 6 vinos (3 tintos, 3 blancos)',
        'Vinos de diferentes regiones',
        'Servicio de sommelier',
        'Maridaje con quesos y embutidos',
        'Copas especializadas',
        'Agua mineral'
      ],
      restrictions: ['Solo disponible para eventos de más de 25 personas', 'No incluye destilados']
    }
  ];

  const [eventTypes, setEventTypes] = useState<EventType[]>([
    {
      id: 'boda',
      name: 'Boda y Celebración',
      icon: <Heart className="w-8 h-8" />,
      description: 'Celebra el amor con estilo',
      basePricePerPerson: 45,
      hourlyRate: pricingConfig.hourlyRate,
      minCapacity: 20,
      maxCapacity: 450,
      minHours: 4,
      maxHours: 12,
      requiresSpecialSetup: true,
      specialRequirements: ['Arco nupcial', 'Mesa de novios', 'Pista de baile'],
      cateringOptions: ['Menú completo', 'Cóctel de bienvenida', 'Pastel de bodas', 'Bar completo'],
      decorationOptions: ['Flores naturales', 'Candelabros', 'Mantelería premium', 'Centros de mesa'],
      audioVisualOptions: ['Sistema de audio profesional', 'Iluminación ambiental', 'Proyector para presentación', 'DJ o banda en vivo']
    },
    {
      id: 'corporativo',
      name: 'Evento Corporativo',
      icon: <Target className="w-8 h-8" />,
      description: 'Profesionalismo y elegancia',
      basePricePerPerson: 35,
      hourlyRate: pricingConfig.hourlyRate,
      minCapacity: 10,
      maxCapacity: 450,
      minHours: 2,
      maxHours: 8,
      requiresSpecialSetup: false,
      specialRequirements: ['Pódium', 'Sistema de presentación'],
      cateringOptions: ['Coffee break', 'Almuerzo ejecutivo', 'Refrigerios', 'Bebidas'],
      decorationOptions: ['Branding corporativo', 'Banderas', 'Mantelería ejecutiva'],
      audioVisualOptions: ['Proyector HD', 'Sistema de audio', 'Micrófonos inalámbricos', 'Pizarra digital']
    },
    {
      id: 'gala',
      name: 'Cena de Gala',
      icon: <Crown className="w-8 h-8" />,
      description: 'Experiencia gastronómica premium',
      basePricePerPerson: 60,
      hourlyRate: pricingConfig.hourlyRate,
      minCapacity: 30,
      maxCapacity: 450,
      minHours: 3,
      maxHours: 8,
      requiresSpecialSetup: true,
      specialRequirements: ['Mesa principal', 'Iluminación especial'],
      cateringOptions: ['Menú gourmet', 'Vinos selectos', 'Servicio de mesa', 'Chef personal'],
      decorationOptions: ['Flores premium', 'Cristalería fina', 'Mantelería de lujo', 'Centros de mesa elegantes'],
      audioVisualOptions: ['Música ambiental', 'Iluminación dramática', 'Sistema de audio discreto']
    },
    {
      id: 'privado',
      name: 'Evento Privado',
      icon: <Star className="w-8 h-8" />,
      description: 'Intimidad y exclusividad',
      basePricePerPerson: 40,
      hourlyRate: pricingConfig.hourlyRate,
      minCapacity: 10,
      maxCapacity: 450,
      minHours: 2,
      maxHours: 10,
      requiresSpecialSetup: false,
      specialRequirements: ['Configuración personalizada'],
      cateringOptions: ['Menú personalizado', 'Bebidas seleccionadas', 'Servicio discreto'],
      decorationOptions: ['Decoración personalizada', 'Ambiente íntimo'],
      audioVisualOptions: ['Música personalizada', 'Iluminación suave']
    },
    {
      id: 'cumpleanos',
      name: 'Cumpleaños',
      icon: <Gift className="w-8 h-8" />,
      description: 'Celebración única y memorable',
      basePricePerPerson: 30,
      hourlyRate: pricingConfig.hourlyRate,
      minCapacity: 15,
      maxCapacity: 450,
      minHours: 3,
      maxHours: 8,
      requiresSpecialSetup: true,
      specialRequirements: ['Mesa de pastel', 'Decoración temática'],
      cateringOptions: ['Pastel personalizado', 'Refrigerios', 'Bebidas', 'Snacks'],
      decorationOptions: ['Decoración temática', 'Globos', 'Banderas', 'Centros de mesa'],
      audioVisualOptions: ['Música animada', 'Iluminación festiva', 'Proyector para fotos']
    },
    {
      id: 'aniversario',
      name: 'Aniversario',
      icon: <StarOutline className="w-8 h-8" />,
      description: 'Renueva tus promesas',
      basePricePerPerson: 35,
      hourlyRate: pricingConfig.hourlyRate,
      minCapacity: 20,
      maxCapacity: 450,
      minHours: 3,
      maxHours: 8,
      requiresSpecialSetup: true,
      specialRequirements: ['Mesa romántica', 'Decoración especial'],
      cateringOptions: ['Menú romántico', 'Vino espumante', 'Pastel especial'],
      decorationOptions: ['Flores románticas', 'Velas', 'Mantelería elegante'],
      audioVisualOptions: ['Música romántica', 'Iluminación suave', 'Proyector para fotos']
    }
  ]);

  // Las reservas se cargan desde el sistema compartido

  const filteredReservations = getActiveReservations(reservations).filter(reservation => {
    // Solo mostrar reservas si hay un término de búsqueda activo
    if (!searchQuery.trim()) {
      return false; // No mostrar nada si no hay búsqueda
    }
    
    const query = searchQuery.toLowerCase();
    const matchesText = reservation.name.toLowerCase().includes(query) ||
      reservation.eventType.toLowerCase().includes(query) ||
      reservation.email.toLowerCase().includes(query) ||
      (reservation.ownerId ? reservation.ownerId.toLowerCase().includes(query) : false);
    
    const matchesDate = reservation.date.includes(searchQuery) || 
      (searchQuery.includes('-') && reservation.date === searchQuery.split('-').reverse().join('/'));
    
    return matchesText || matchesDate;
  });

  // Funciones getStatusColor y getStatusText importadas desde @/lib/reservations

  const calculatePrice = (eventType: EventType, guests: number, selectedRooms: string[], duration: number) => {
    const basePrice = eventType.basePricePerPerson * guests;
    const hourlyRate = pricingConfig.hourlyRate * duration;
    const roomCost = selectedRooms.length * pricingConfig.salones;
    
    const cateringCost = eventType.cateringOptions.length > 0 ? guests * pricingConfig.catering : 0;
    const decorationCost = eventType.decorationOptions.length > 0 ? guests * pricingConfig.decoracion : 0;
    const audioVisualCost = eventType.audioVisualOptions.length > 0 ? guests * pricingConfig.audioVisual : 0;
    const specialSetupCost = eventType.requiresSpecialSetup ? pricingConfig.setup : 0;
    
    return {
      basePrice,
      hourlyRate,
      roomCost,
      cateringCost,
      decorationCost,
      audioVisualCost,
      specialSetupCost,
      total: basePrice + hourlyRate + roomCost + cateringCost + decorationCost + audioVisualCost + specialSetupCost
    };
  };

  const getReservationsForDate = (date: string) => {
    return reservations.filter(reservation => reservation.date === date);
  };

  const downloadReservationDocument = (reservation: Reservation) => {
    downloadReservationPdf(reservation)
  };

  const createReservation = () => {
    if (!selectedEventType || !selectedDate || !formData.time || !formData.guests || !formData.duration) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (!isAnonymous && (!formData.name || !formData.email || !formData.phone)) {
      alert('Por favor completa la información personal o selecciona "Evento Anónimo"');
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
    const selectedEvent = eventTypes.find(e => e.id === selectedEventType);
    if (!selectedEvent) return;
    
    if (containsInappropriateContent(selectedEvent.name)) {
      alert('Tipo de evento no permitido. Selecciona un evento apropiado.');
      return;
    }

    const guests = parseInt(formData.guests);
    const duration = parseInt(formData.duration);
    
    const pricing = calculatePrice(selectedEvent, guests, ['room1'], duration);
    const currentUserId = typeof window !== 'undefined' ? (localStorage.getItem('marlett-user-id') || (() => { const v = crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`; localStorage.setItem('marlett-user-id', v); return v; })()) : undefined;
    
    const newReservation: Reservation = {
      id: `${Date.now()}`,
      ownerId: currentUserId,
      isAnonymous,
      name: isAnonymous ? 'Evento Anónimo' : formData.name,
      email: isAnonymous ? 'anonimo@marlett.com' : formData.email,
      phone: isAnonymous ? 'Privado' : formData.phone,
      realName: isAnonymous ? formData.name : undefined,
      realEmail: isAnonymous ? formData.email : undefined,
      realPhone: isAnonymous ? formData.phone : undefined,
      date: selectedDate.split('-').reverse().join('/'),
      time: formData.time,
      duration: duration,
      eventType: selectedEvent.name,
      status: 'pending',
      guests: guests,
      rooms: ['room1'],
      totalPrice: pricing.total,
      priceBreakdown: pricing,
      cateringSelection: selectedEvent.cateringOptions.slice(0, 2),
      decorationSelection: selectedEvent.decorationOptions.slice(0, 2),
      audioVisualSelection: selectedEvent.audioVisualOptions.slice(0, 2),
      notes: [],
      avatar: isAnonymous ? 'AN' : formData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    addReservation(newReservation);
    setReservations(getReservations()); // Recargar desde el almacenamiento
    setLastCreatedReservation(newReservation);
    setReservationSaved(true);
    
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
    
    alert('¡Reserva creada exitosamente!');
  };

  const addCustomEventType = () => {
    const trimmed = customEventType.trim();
    
    // Limpiar error previo
    setCustomEventError('');
    
    if (!trimmed) {
      setCustomEventError('Por favor ingresa un tipo de evento.');
      return;
    }
    
    // Validar contenido apropiado
    if (containsInappropriateContent(trimmed)) {
      setCustomEventError('Contenido no permitido. Usa un lenguaje apropiado para eventos familiares.');
      return;
    }
    
    if (!isValidEventType(trimmed)) {
      setCustomEventError('Ingresa un evento apropiado (ej: Cumpleaños, Boda, Graduación, Reunión).');
      return;
    }
    
    // Verificar que no sea duplicado
    const exists = eventTypes.some(et => et.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setCustomEventError('Este tipo de evento ya existe. Por favor elige otro nombre.');
      return;
    }
    
    const sanitized = sanitizeText(trimmed);
    
    const newEventType: EventType = {
      id: `custom_${Date.now()}`,
      name: sanitized,
      icon: <Star className="w-8 h-8" />,
      description: 'Evento personalizado',
      basePricePerPerson: 40,
      hourlyRate: pricingConfig.hourlyRate,
      minCapacity: 10,
      maxCapacity: 450,
      minHours: 2,
      maxHours: 10,
      requiresSpecialSetup: false,
      specialRequirements: ['Configuración personalizada'],
      cateringOptions: ['Menú personalizado', 'Bebidas'],
      decorationOptions: ['Decoración personalizada'],
      audioVisualOptions: ['Música personalizada', 'Iluminación básica']
    };

    setEventTypes(prev => [...prev, newEventType]);
    setCustomEventType('');
    setCustomEventError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100">
      {/* Header Elegante */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-800 via-green-700 to-green-600"></div>
        
        <div className="relative z-10 backdrop-blur-xl bg-white/10 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => {
                    // Secret admin access: 7 clicks within 8 seconds
                    const count = Number(sessionStorage.getItem('adm_clicks') || '0') + 1;
                    sessionStorage.setItem('adm_clicks', String(count));
                    const first = Number(sessionStorage.getItem('adm_first_ts') || '0');
                    const now = Date.now();
                    if (!first) sessionStorage.setItem('adm_first_ts', String(now));
                    const within8s = first && now - first < 8000;
                    if (within8s && count >= 7) {
                      const k = prompt('Acceso restringido. Ingresa la clave:');
                      if (k && k.trim() === (process.env.NEXT_PUBLIC_ADMIN_KEY || 'marlett-admin')) {
                        localStorage.setItem('marlett-admin-token', '1');
                        window.location.href = '/admin';
                      }
                      sessionStorage.removeItem('adm_clicks');
                      sessionStorage.removeItem('adm_first_ts');
                    } else if (!within8s && count > 1) {
                      sessionStorage.setItem('adm_clicks', '1');
                      sessionStorage.setItem('adm_first_ts', String(now));
                    }
                  }}
                >
                  <div className="w-48 h-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300 border border-white/20">
                    <img
                      src="/dorado.svg"
                      alt="Dorado Logo"
                      className="w-44 h-16"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  {/* Nota de capacidades movida a la sección de información de capacidad */}
                </div>
                
                <div>
                  <p className="text-stone-100 text-lg font-medium">
                    Sistema de Reservas Inteligente
                  </p>
                </div>
        </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setShowGallery(true)}
                  className="bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 transition-all duration-300"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Galería
                </Button>
                
                <Button
                  onClick={() => setShowMenuModal(true)}
                  className="bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 transition-all duration-300"
                >
                  <TreePine className="w-5 h-5 mr-2" />
                  Menú Completo
                </Button>
                
                <Button
                  onClick={() => setShowRoomManager(true)}
                  className="bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 transition-all duration-300"
                >
                  <Building2 className="w-5 h-5 mr-2" />
                  División de Salones
                </Button>

                {/* Admin button removed - access via secret logo clicks */}
                
                {/* Header search bar removed - search moved to reservations panel */}
              </div>
            </div>
          </div>
        </div>
          </div>
          
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* CTA de Reserva */}
        <div className="relative mb-12 overflow-hidden rounded-3xl border border-stone-200 bg-white/90 backdrop-blur-xl">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(/images/wood-pattern.svg)' }} />
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-2">Reserva tu evento en Marlett</h2>
              <p className="text-stone-600">Elegancia, cocina de autor y espacios versátiles para toda ocasión.</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-green-700 hover:bg-green-800"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Reservar ahora
              </Button>
              <Button
                onClick={() => setShowGallery(true)}
                variant="outline"
                className="border-stone-300"
              >
                <Image className="w-5 h-5 mr-2" />
                Ver galería
              </Button>
            </div>
          </div>
        </div>
        {/* Statistics section removed per request */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Panel Izquierdo - Nueva Reserva */}
          <div id="booking" className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-700 to-green-800 text-white p-8">
                <CardTitle className="text-3xl font-bold flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  Nueva Reserva
                </CardTitle>
                <CardDescription className="text-green-100 text-lg">
                  Sistema completo con precios por hora y eventos anónimos
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8">
                {/* Tipos de Evento */}
                <div>
                  <Label className="text-xl font-bold text-stone-800 mb-6 block flex items-center gap-3">
                    <TreePine className="w-6 h-6 text-green-700" />
                    Selecciona el Tipo de Evento
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    {eventTypes.map((eventType) => (
                      <div
                        key={eventType.id}
                        onClick={() => setSelectedEventType(eventType.id)}
                        className={`group cursor-pointer transition-all duration-500 hover:scale-105 ${
                          selectedEventType === eventType.id
                            ? 'ring-4 ring-green-500 ring-offset-4'
                            : 'hover:shadow-2xl'
                        }`}
                      >
                        <div className="bg-gradient-to-br from-stone-700 via-stone-800 to-stone-900 rounded-2xl p-6 text-white transform transition-all duration-300">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                              {eventType.icon}
                            </div>
                            <div>
                              <h4 className="font-bold text-lg">{eventType.name}</h4>
                              <p className="text-white/80 text-sm">{eventType.description}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 gap-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                                  ${eventType.basePricePerPerson}/persona
                                </span>
                                <span className="text-sm bg-amber-500/30 px-3 py-1 rounded-full font-bold">
                                  $3,000 MX/hora
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                                  {eventType.minCapacity}-{eventType.maxCapacity} invitados
                                </span>
                                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                                  {eventType.minHours}-{eventType.maxHours} horas
                                </span>
                              </div>
                            </div>
                            {selectedEventType === eventType.id && (
                              <div className="flex items-center justify-center">
                                <Check className="w-6 h-6 text-green-300 animate-bounce" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Evento Personalizado */}
                  <div className="mt-6 p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <Label className="text-lg font-semibold text-stone-800 mb-3 block">
                      ¿No encuentras tu tipo de evento?
                    </Label>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <Input
                          placeholder="Ej: Reunión Familiar, Celebración de Logros, Cena de Amigos..."
                          value={customEventType}
                          onChange={(e) => {
                            setCustomEventType(e.target.value);
                            setCustomEventError('');
                          }}
                          className={`flex-1 ${customEventError ? 'border-red-300 focus:ring-red-500' : ''}`}
                          maxLength={50}
                        />
                        <Button 
                          onClick={addCustomEventType} 
                          className="bg-green-700 hover:bg-green-800"
                          disabled={!customEventType.trim()}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar
                        </Button>
                      </div>
                      
                      {customEventError && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-700">{customEventError}</p>
                        </div>
                      )}
                      
                      <div className="text-xs text-stone-500">
                        <p><strong>✅ Permitidos:</strong> Cumpleaños, Bodas, Graduaciones, Reuniones, Eventos Corporativos, Celebraciones, Aniversarios</p>
                        <p><strong>❌ No permitidos:</strong> Contenido ofensivo, sexual, racista, violento o inapropiado</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información del Cliente */}
                <div className="space-y-6">
                  <Label className="text-xl font-bold text-stone-800 mb-6 block flex items-center gap-3">
                    <Users className="w-6 h-6 text-green-700" />
                    Información del Cliente
                  </Label>
                  
                  {/* Checkbox de Anonimato */}
                  <div className="flex items-center space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                    />
                    <Label htmlFor="anonymous" className="text-stone-700 font-semibold cursor-pointer">
                      Evento Anónimo (no mostrar información personal)
                    </Label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-stone-700 font-semibold">
                        Nombre completo {!isAnonymous && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                          const value = sanitizeText(e.target.value);
                          setFormData(prev => ({...prev, name: value}));
                        }}
                        disabled={isAnonymous}
                        placeholder={isAnonymous ? "Se mostrará como 'Evento Anónimo'" : "Ingresa tu nombre"}
                        className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 disabled:bg-gray-100"
                        maxLength={50}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-stone-700 font-semibold">
                        Email {!isAnonymous && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                        disabled={isAnonymous}
                        placeholder={isAnonymous ? "Privado" : "tu@email.com"}
                        className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-stone-700 font-semibold">
                      Teléfono {!isAnonymous && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                      disabled={isAnonymous}
                      placeholder={isAnonymous ? "Privado" : "+34 612 345 678"}
                      className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Fecha y Hora del Evento */}
                <div className="space-y-6">
                  <Label className="text-xl font-bold text-stone-800 mb-6 block flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-green-700" />
                    Fecha y Hora del Evento
                  </Label>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="date" className="text-stone-700 font-semibold">
                        Fecha del Evento <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="time" className="text-stone-700 font-semibold">
                        Hora de Inicio <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData(prev => ({...prev, time: e.target.value}))}
                        min="08:00"
                        max="11:59"
                        className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300"
                      />
                      <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Horarios operativos: 9:00 AM - 12:00 PM únicamente
          </p>
        </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="guests" className="text-stone-700 font-semibold">
                        Número de Invitados <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="guests"
                        type="number"
                        value={formData.guests}
                        onChange={(e) => setFormData(prev => ({...prev, guests: e.target.value}))}
                        placeholder="Ej: 120"
                        min="1"
                        max="450"
                        className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300"
                      />
                      {formData.guests && (
                        (() => {
                          const n = parseInt(formData.guests);
                          if (isNaN(n) || n <= 0) return null;
                          const getRoomsAdvice = (guestsCount: number) => {
                            if (guestsCount <= 80) return { rooms: 1, max: 80 };
                            if (guestsCount <= 200) return { rooms: 2, max: 200 };
                            if (guestsCount <= 300) return { rooms: 3, max: 300 };
                            if (guestsCount <= 450) return { rooms: 4, max: 450 };
                            return { rooms: 4, max: 450 };
                          };
                          const advice = getRoomsAdvice(n);
                          const overCapacity = n > 450;
                          return (
                            <div className={`mt-2 text-sm ${overCapacity ? 'text-red-700' : 'text-stone-700'}`}>
                              {!overCapacity ? (
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4 text-green-700" />
                                  <span>
                                    Recomendación: {advice.rooms} {advice.rooms === 1 ? 'Salón Privado' : 'Salones Privados'} (capacidad hasta {advice.max} personas)
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-red-700" />
                                  <span>
                                    Capacidad máxima superada (450 personas). Reduce invitados o consulta por eventos especiales.
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })()
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="duration" className="text-stone-700 font-semibold">
                        Duración (horas) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({...prev, duration: e.target.value}))}
                        placeholder="Ej: 6"
                        min="1"
                        max="12"
                        className="h-12 bg-stone-50 border-stone-200 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Reservas del Día Seleccionado */}
                {selectedDate && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Reservas para {selectedDate}:
                    </h4>
                    {getReservationsForDate(selectedDate.split('-').reverse().join('/')).length > 0 ? (
                      <div className="space-y-2">
                        {getReservationsForDate(selectedDate.split('-').reverse().join('/')).map((res) => (
                          <div key={res.id} className="bg-white p-3 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-blue-800">{res.name}</span>
                              <span className="text-sm text-blue-600">{res.time} - {res.eventType}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-blue-600 text-sm">No hay reservas para esta fecha</p>
                    )}
                  </div>
                )}

                {/* Calculadora de Precios en Tiempo Real */}
                {formData.guests && formData.duration && selectedEventType && (
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Estimación de Precio
                    </h4>
                    {(() => {
                      const selectedEvent = eventTypes.find(e => e.id === selectedEventType);
                      if (!selectedEvent) return null;
                      
                      const guests = parseInt(formData.guests);
                      const duration = parseInt(formData.duration);
                      const pricing = calculatePrice(selectedEvent, guests, ['room1'], duration);
                      
                      return (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-green-700">Base ({guests} personas):</span>
                            <span className="font-semibold">${pricing.basePrice.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-amber-700">Horas ({duration} × $3,000 MX):</span>
                            <span className="font-semibold text-amber-700">${pricing.hourlyRate.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-green-700">Salón + Servicios:</span>
                            <span className="font-semibold">${(pricing.roomCost + pricing.cateringCost + pricing.decorationCost + pricing.audioVisualCost + pricing.specialSetupCost).toLocaleString()}</span>
                          </div>
                          <hr className="border-green-300" />
                          <div className="flex justify-between items-center text-lg">
                            <span className="text-green-800 font-bold">Total Estimado:</span>
                            <span className="font-bold text-green-800 text-xl">${pricing.total.toLocaleString()}</span>
      </div>
    </div>
  );
                    })()}
                  </div>
                )}

                {/* Selección de Menú y Barra Libre */}
                <div className="space-y-6">
                  <Label className="text-xl font-bold text-stone-800 mb-6 block flex items-center gap-3">
                    <TreePine className="w-6 h-6 text-green-700" />
                    Menú y Servicios Gastronómicos
                  </Label>

                  {/* Paquetes de Menú */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-stone-800 flex items-center gap-2">
                      <TreePine className="w-5 h-5 text-green-700" />
                      Selecciona tu Menú
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {menuPackages.filter(pkg => pkg.id !== 'package-custom').map((menuPkg) => (
                        <div
                          key={menuPkg.id}
                          onClick={() => setSelectedMenuPackage(menuPkg.id)}
                          className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
                            selectedMenuPackage === menuPkg.id
                              ? 'border-green-600 bg-green-50'
                              : 'border-stone-200 bg-white hover:border-green-400'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-bold text-stone-800">{menuPkg.name}</h5>
                            {selectedMenuPackage === menuPkg.id && (
                              <Check className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-stone-600 mb-3">{menuPkg.description}</p>
                          <div className="space-y-1 text-xs text-stone-500">
                            <p>• {menuPkg.courses.entradas.length} entradas</p>
                            <p>• {menuPkg.courses.platosFuertes.length} platos fuertes</p>
                            <p>• {menuPkg.courses.postres.length} postres</p>
                          </div>
                          <div className="mt-3 pt-3 border-t border-stone-200">
                            <p className="font-bold text-green-700">${menuPkg.pricePerPerson}/persona</p>
                            <p className="text-xs text-stone-500">Mínimo {menuPkg.minPeople} personas</p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Opción de Menú Personalizado */}
                      <div
                        onClick={() => {
                          setSelectedMenuPackage('package-custom');
                          setShowCustomMenuBuilder(true);
                        }}
                        className="cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 border-amber-300 bg-amber-50 hover:border-amber-500 hover:bg-amber-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-bold text-amber-800">Menú Personalizado</h5>
                          <Settings className="w-5 h-5 text-amber-600" />
                        </div>
                        <p className="text-sm text-amber-700 mb-3">Diseña tu propio menú seleccionando platillos individuales</p>
                        <div className="space-y-1 text-xs text-amber-600">
                          <p>• Elige tus platillos favoritos</p>
                          <p>• Precios individuales por platillo</p>
                          <p>• Máxima flexibilidad</p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-amber-200">
                          <p className="font-bold text-amber-700">Precio por platillo</p>
                          <p className="text-xs text-amber-600">Mínimo 10 personas</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Paquetes de Barra Libre */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-stone-800 flex items-center gap-2">
                      <TreePine className="w-5 h-5 text-green-700" />
                      Barra Libre (Opcional)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {barPackages.map((barPkg) => (
                        <div
                          key={barPkg.id}
                          onClick={() => setSelectedBarPackage(selectedBarPackage === barPkg.id ? '' : barPkg.id)}
                          className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
                            selectedBarPackage === barPkg.id
                              ? 'border-green-600 bg-green-50'
                              : 'border-stone-200 bg-white hover:border-green-400'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-bold text-stone-800">{barPkg.name}</h5>
                            {selectedBarPackage === barPkg.id && (
                              <Check className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-stone-600 mb-3">{barPkg.description}</p>
                          <div className="space-y-1 text-xs text-stone-500">
                            <p>• Duración: {barPkg.duration} horas</p>
                            <p>• {barPkg.includes.length} servicios incluidos</p>
                          </div>
                          <div className="mt-3 pt-3 border-t border-stone-200">
                            <p className="font-bold text-green-700">${barPkg.pricePerPerson}/persona</p>
                            <p className="text-xs text-stone-500">{barPkg.duration}h de servicio</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Políticas de Servicios */}
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-semibold text-amber-800 mb-2">Políticas de Calidad Marlett</h5>
                        <div className="text-sm text-amber-700 space-y-2">
                          <p>
                            <strong>• No se permite el ingreso de alimentos externos.</strong> Todos los platillos deben ser preparados por nuestro equipo culinario para garantizar la calidad y seguridad alimentaria.
                          </p>
                          <p>
                            <strong>• No se permite el ingreso de bebidas externas.</strong> Contamos con una amplia selección de bebidas y cocteles preparados por nuestros bartenders certificados.
                          </p>
                          <p>
                            <strong>• Servicios de terceros:</strong> Solo se permiten servicios complementarios como fotografía, música y decoración adicional previa autorización.
                          </p>
                          <p className="text-xs text-amber-600 mt-3">
                            Estas políticas nos permiten mantener los estándares de calidad Marlett y brindar la mejor experiencia gastronómica.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botón para ver detalles del menú */}
                  {selectedMenuPackage && (
                    <div className="text-center">
                      <Button
                        onClick={() => setShowMenuModal(true)}
                        variant="outline"
                        className="border-green-600 text-green-700 hover:bg-green-50"
                      >
                        Ver Detalles del Menú Seleccionado
                      </Button>
                    </div>
                  )}
                </div>

                {/* Información de Capacidad */}
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <h4 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-green-700" />
                    Información de Capacidad
                  </h4>
                  <div className="text-sm text-stone-600">
                    <p className="mb-2">
                      <span className="font-semibold">Capacidad máxima total:</span> 450 personas
                    </p>
                    <p>
                      Los salones se asignan automáticamente según el número de invitados y se pueden fusionar para eventos más grandes.
                    </p>
                  </div>
                </div>

                {/* Política de Contenido */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Política de Contenido
                  </h4>
                  <p className="text-sm text-blue-700">
                    <strong>Restaurante familiar:</strong> Solo eventos apropiados y respetuosos. 
                    Sin contenido ofensivo, sexual, racista o violento.
                  </p>
                </div>

                {/* Botón de Crear Reserva */}
                <Button 
                  onClick={createReservation}
                  className="w-full h-14 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Crear Reserva
                </Button>

              {/* Éxito y descarga de documento */}
              {reservationSaved && lastCreatedReservation && (
                <div className="mt-4 p-4 rounded-xl border border-green-200 bg-green-50">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-green-800 text-sm">
                      ¡Reserva creada! Puedes descargar el documento con los detalles.
                    </div>
                    <DownloadPDF
                      event={lastCreatedReservation}
                      label="Descargar PDF"
                      variant="outline"
                      className="border-green-600 text-green-700 hover:bg-green-50"
                    />
                  </div>
                </div>
              )}
              </CardContent>
            </Card>
          </div>

          {/* Panel Derecho - Reservas Existentes */}
          <div className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-stone-700 to-stone-800 text-white p-8">
                <CardTitle className="text-3xl font-bold flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Leaf className="w-6 h-6" />
                  </div>
                  Reservas Activas
                </CardTitle>
                <CardDescription className="text-stone-100 text-lg">
                  Gestiona y visualiza todas tus reservas
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-8">
                {/* Filtro por Fecha */}
                <div className="mb-6 p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <Label className="text-stone-700 font-semibold mb-3 block">
                    Filtrar reservas:
                  </Label>
                  <Input
                    type="text"
                    placeholder="Buscar por nombre, evento, fecha o ID de usuario"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 bg-white border-stone-200 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <div className="mt-2 flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setSearchQuery('')}
                      className="text-xs"
                    >
                      Mostrar Todas
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setSearchQuery(new Date().toLocaleDateString('es-ES'))}
                      className="text-xs"
                    >
                      Solo Hoy
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {!searchQuery.trim() ? (
                    <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
                      <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-stone-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-stone-800 mb-2">Buscar Reservas</h3>
                      <p className="text-stone-600 mb-4">
                        Ingresa un nombre, email, tipo de evento, fecha o ID de usuario para buscar reservas específicas.
                      </p>
                      <p className="text-sm text-stone-500">
                        Ejemplo: "María", "Boda", "14/12/2024", "2024-12-14" o tu ID de usuario para eventos anónimos
                      </p>
                    </div>
                  ) : filteredReservations.length === 0 ? (
                    <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
                      <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-stone-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-stone-800 mb-2">Sin Resultados</h3>
                      <p className="text-stone-600">
                        No se encontraron reservas que coincidan con tu búsqueda: "{searchQuery}"
                      </p>
                    </div>
                  ) : 
                    filteredReservations.map((reservation) => (
                    <div key={reservation.id} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-stone-100">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-stone-600 to-stone-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {reservation.avatar}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-stone-800 mb-2">{reservation.name}</h3>
                            <div className="flex items-center gap-3">
                              <Badge className={`${getStatusColor(reservation.status)} font-semibold px-4 py-2 rounded-full`}>
                                {getStatusText(reservation.status)}
                              </Badge>
                              <Badge variant="secondary" className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-200 font-medium px-4 py-2 rounded-full">
                                {reservation.eventType}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="p-3 h-12 w-12 border-stone-300 hover:border-green-600 hover:bg-green-50 transition-all duration-300 rounded-xl"
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setShowEventModal(true);
                            }}
                          >
                            <Edit className="w-5 h-5 text-stone-600" />
                          </Button>
                          <Button size="sm" variant="outline" className="p-3 h-12 w-12 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-300 rounded-xl">
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>

                      {/* Información del Evento */}
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-stone-600">
                            <Users className="w-5 h-5 text-green-700" />
                            <span className="font-medium">{reservation.guests} invitados</span>
                          </div>
                          <div className="flex items-center gap-3 text-stone-600">
                            <Building2 className="w-5 h-5 text-green-700" />
                            <span className="font-medium">{reservation.rooms.length} salón{reservation.rooms.length > 1 ? 'es' : ''}</span>
                          </div>
                          <div className="flex items-center gap-3 text-stone-600">
                            <Clock className="w-5 h-5 text-amber-600" />
                            <span className="font-medium">{reservation.duration} horas</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-stone-600">
                            <Calendar className="w-5 h-5 text-green-700" />
                            <span className="font-medium">{reservation.date}</span>
                          </div>
                          <div className="flex items-center gap-3 text-stone-600">
                            <Clock className="w-5 h-5 text-green-700" />
                            <span className="font-medium">{reservation.time}</span>
                          </div>
                          <div className="flex items-center gap-3 text-amber-700">
                            <DollarSign className="w-5 h-5" />
                            <span className="font-medium">$3,000 MX/hora</span>
                          </div>
                        </div>
                      </div>

                      {/* Precio y Detalles */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-green-700">
                            ${reservation.totalPrice.toLocaleString()}
                          </span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            Precio Total
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <p className="text-stone-600">Base: ${reservation.priceBreakdown.basePrice.toLocaleString()}</p>
                            <p className="text-amber-700 font-semibold">Horas: ${reservation.priceBreakdown.hourlyRate.toLocaleString()}</p>
                            <p className="text-stone-600">Salones: ${reservation.priceBreakdown.roomCost.toLocaleString()}</p>
                            <p className="text-stone-600">Catering: ${reservation.priceBreakdown.cateringCost.toLocaleString()}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-stone-600">Decoración: ${reservation.priceBreakdown.decorationCost.toLocaleString()}</p>
                            <p className="text-stone-600">Audio/Visual: ${reservation.priceBreakdown.audioVisualCost.toLocaleString()}</p>
                            <p className="text-stone-600">Setup: ${reservation.priceBreakdown.specialSetupCost.toLocaleString()}</p>
                            <p className="text-xs text-stone-500 mt-2">({reservation.duration} horas × $3,000 MX)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Gestión de Salones */}
      {showRoomManager && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-stone-800">División de Salones Privados</h2>
                <Button
                  onClick={() => setShowRoomManager(false)}
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {rooms.map((room) => (
                  <div key={room.id} className="bg-white rounded-xl border border-stone-200 shadow-lg overflow-hidden">
                    {/* Imagen del salón */}
                    <div className="relative h-48 bg-gradient-to-br from-stone-200 to-stone-300 overflow-hidden">
                      <img 
                        src={room.image} 
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <p className="text-sm font-medium text-white">{room.description}</p>
                      </div>
                      
                      {/* Badge de estado */}
                      <div className="absolute top-4 right-4">
                        <Badge variant={room.isActive ? "default" : "secondary"} className="bg-green-700 text-white">
                          {room.isActive ? "Disponible" : "No Disponible"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-stone-800">{room.name}</h3>
                        {room.features.includes('Proyector multimedia') && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                            Con Proyector
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-600">Capacidad:</span>
                          <span className="font-semibold text-stone-800">{room.capacity} personas</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-stone-600">Precio base:</span>
                          <span className="font-semibold text-green-700">${room.basePrice}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <span className="text-stone-600 text-sm">Equipamiento:</span>
                          <div className="flex flex-wrap gap-2">
                            {room.features.map((feature, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className={`text-xs ${feature.includes('Proyector') ? 'bg-amber-50 text-amber-700 border-amber-300' : ''}`}
                              >
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Información General de Salones */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Especificaciones Técnicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="font-semibold text-stone-700">Equipamiento Estándar:</p>
                    <ul className="text-stone-600 space-y-1">
                      <li>• Televisor HD en cada salón</li>
                      <li>• Sistema de sonido profesional</li>
                      <li>• Iluminación LED regulable</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-stone-700">Equipamiento Especial:</p>
                    <ul className="text-stone-600 space-y-1">
                      <li>• Proyector multimedia disponible</li>
                      <li>• Ubicación: Salón Privado D únicamente</li>
                      <li>• Ideal para presentaciones corporativas</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                  <Merge className="w-5 h-5" />
                  Sistema de Fusión de Salones Privados
                </h3>
                <p className="text-green-700 mb-4 text-sm">
                  Nuestros salones privados pueden fusionarse para acomodar eventos de mayor envergadura, 
                  manteniendo la exclusividad y privacidad requerida.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="col-span-1 md:col-span-2">
                    <p className="font-semibold text-green-700">Información de capacidad</p>
                    <p className="text-green-600">
                      1 Salón Privado (hasta 80), 2 Salones Privados (hasta 200), 3 Salones Privados (hasta 300), 4 Salones Privados (hasta 450)
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <Info className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      La fusión de salones mantiene todas las características técnicas y permite configuraciones flexibles según las necesidades del evento.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición de Evento */}
      {showEventModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-stone-800">Editar Evento</h2>
                <Button
                  onClick={() => setShowEventModal(false)}
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Información Básica */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-stone-700 font-semibold">Nombre del Cliente</Label>
                    <Input value={selectedReservation.name} className="mt-2" readOnly />
                  </div>
                  <div>
                    <Label className="text-stone-700 font-semibold">Email</Label>
                    <Input value={selectedReservation.email} className="mt-2" readOnly />
                  </div>
                </div>

                {/* Detalles del Evento */}
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <Label className="text-stone-700 font-semibold">Tipo de Evento</Label>
                    <Input value={selectedReservation.eventType} className="mt-2" readOnly />
                  </div>
                  <div>
                    <Label className="text-stone-700 font-semibold">Número de Invitados</Label>
                    <Input value={selectedReservation.guests.toString()} className="mt-2" readOnly />
                  </div>
                  <div>
                    <Label className="text-stone-700 font-semibold">Duración (horas)</Label>
                    <Input value={selectedReservation.duration.toString()} className="mt-2" readOnly />
                  </div>
                </div>

                {/* Precio y Confirmación */}
                <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-stone-800">Resumen de Precios</h3>
                    <span className="text-3xl font-bold text-green-700">
                      ${selectedReservation.totalPrice.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-stone-600">Base: ${selectedReservation.priceBreakdown.basePrice.toLocaleString()}</p>
                      <p className="text-amber-700 font-semibold">Horas: ${selectedReservation.priceBreakdown.hourlyRate.toLocaleString()}</p>
                      <p className="text-stone-600">Salones: ${selectedReservation.priceBreakdown.roomCost.toLocaleString()}</p>
                      <p className="text-stone-600">Catering: ${selectedReservation.priceBreakdown.cateringCost.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-stone-600">Decoración: ${selectedReservation.priceBreakdown.decorationCost.toLocaleString()}</p>
                      <p className="text-stone-600">Audio/Visual: ${selectedReservation.priceBreakdown.audioVisualCost.toLocaleString()}</p>
                      <p className="text-stone-600">Setup: ${selectedReservation.priceBreakdown.specialSetupCost.toLocaleString()}</p>
                      <p className="text-xs text-amber-600 mt-2 font-medium">({selectedReservation.duration} horas × $3,000 MX)</p>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-4 justify-end">
                  <Button variant="outline" onClick={() => setShowEventModal(false)}>
                    Cerrar
                  </Button>
                  <Button className="bg-green-700 hover:bg-green-800">
                    <Check className="w-4 h-4 mr-2" />
                    Confirmar Reserva
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles del Menú */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-stone-800">
                  {selectedMenuPackage 
                    ? menuPackages.find(pkg => pkg.id === selectedMenuPackage)?.name
                    : 'Menú Completo Marlett'
                  }
                </h2>
                <Button
                  onClick={() => setShowMenuModal(false)}
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {(() => {
                const menuPkg = selectedMenuPackage ? menuPackages.find(pkg => pkg.id === selectedMenuPackage) : null;
                
                // Si no hay paquete seleccionado, mostrar menú completo
                if (!selectedMenuPackage) {
                  return (
                    <div className="space-y-8">
                      {/* Información general */}
                      <div className="text-center bg-green-50 rounded-xl p-6 border border-green-200">
                        <h3 className="text-xl font-bold text-green-800 mb-2">Menú Marlett - 40 Artículos</h3>
                        <p className="text-green-700">Experiencia gastronómica completa con platillos de autor</p>
                      </div>

                      {/* Cortesías */}
                      <div>
                        <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                          <TreePine className="w-5 h-5 text-green-700" />
                          Cortesías de la Casa
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {menuItems.filter(item => item.price === 0).map((item) => (
                            <div key={item.id} className="bg-green-50 rounded-xl p-4 border border-green-200">
                              <h4 className="font-semibold text-green-800">{item.name}</h4>
                              <p className="text-sm text-green-600">{item.description}</p>
                              <span className="text-sm font-bold text-green-700">Cortesía</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Entradas */}
                      <div>
                        <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                          <TreePine className="w-5 h-5 text-green-700" />
                          Entradas y Ensaladas
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {menuItems.filter(item => (item.category === 'entrada-fria' || item.category === 'ensalada' || item.category === 'entrada-caliente') && item.price > 0).map((item) => (
                            <div key={item.id} className="bg-stone-50 rounded-xl p-4">
                              <h4 className="font-semibold text-stone-800">{item.name}</h4>
                              <p className="text-sm text-stone-600 mb-2">{item.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-green-700">${item.price}</span>
                                {item.allergens && item.allergens.length > 0 && (
                                  <span className="text-xs text-amber-600">
                                    Contiene: {item.allergens.join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Platos Fuertes */}
                      <div>
                        <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                          <TreePine className="w-5 h-5 text-green-700" />
                          Platos Principales
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {menuItems.filter(item => item.category === 'principal' || item.category === 'corte').map((item) => (
                            <div key={item.id} className="bg-stone-50 rounded-xl p-4">
                              <h4 className="font-semibold text-stone-800">{item.name}</h4>
                              <p className="text-sm text-stone-600 mb-2">{item.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-green-700">${item.price}</span>
                                {item.allergens && item.allergens.length > 0 && (
                                  <span className="text-xs text-amber-600">
                                    Contiene: {item.allergens.join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Postres */}
                      <div>
                        <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                          <TreePine className="w-5 h-5 text-green-700" />
                          Postres
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {menuItems.filter(item => item.category === 'postre').map((item) => (
                            <div key={item.id} className="bg-stone-50 rounded-xl p-4">
                              <h4 className="font-semibold text-stone-800">{item.name}</h4>
                              <p className="text-sm text-stone-600 mb-2">{item.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-green-700">${item.price}</span>
                                {item.allergens && item.allergens.length > 0 && (
                                  <span className="text-xs text-amber-600">
                                    Contiene: {item.allergens.join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Políticas */}
                      <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h5 className="font-semibold text-amber-800 mb-2">Políticas de Calidad Marlett</h5>
                            <div className="text-sm text-amber-700 space-y-2">
                              <p><strong>• No se permite el ingreso de alimentos externos.</strong></p>
                              <p><strong>• No se permite el ingreso de bebidas externas.</strong></p>
                              <p><strong>• Servicios de terceros solo previa autorización.</strong></p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                if (!menuPkg) return null;

                return (
                  <div className="space-y-8">
                    {/* Descripción del Paquete */}
                    <div className="text-center">
                      <p className="text-lg text-stone-600 mb-4">{menuPkg.description}</p>
                      <div className="flex items-center justify-center gap-6 text-green-700">
                        <span className="text-2xl font-bold">${menuPkg.pricePerPerson}/persona</span>
                        <span className="text-sm">Mínimo {menuPkg.minPeople} personas</span>
                      </div>
                    </div>

                    {/* Entradas */}
                    <div>
                      <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                        <TreePine className="w-5 h-5 text-green-700" />
                        Entradas
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menuPkg.courses.entradas.map((item) => (
                          <div key={item.id} className="bg-stone-50 rounded-xl p-4">
                            <h4 className="font-semibold text-stone-800">{item.name}</h4>
                            <p className="text-sm text-stone-600 mb-2">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-green-700">${item.price}</span>
                              {item.allergens && item.allergens.length > 0 && (
                                <span className="text-xs text-amber-600">
                                  Contiene: {item.allergens.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Platos Fuertes */}
                    <div>
                      <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                        <TreePine className="w-5 h-5 text-green-700" />
                        Platos Fuertes
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menuPkg.courses.platosFuertes.map((item) => (
                          <div key={item.id} className="bg-stone-50 rounded-xl p-4">
                            <h4 className="font-semibold text-stone-800">{item.name}</h4>
                            <p className="text-sm text-stone-600 mb-2">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-green-700">${item.price}</span>
                              {item.allergens && item.allergens.length > 0 && (
                                <span className="text-xs text-amber-600">
                                  Contiene: {item.allergens.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Postres */}
                    <div>
                      <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                        <TreePine className="w-5 h-5 text-green-700" />
                        Postres
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menuPkg.courses.postres.map((item) => (
                          <div key={item.id} className="bg-stone-50 rounded-xl p-4">
                            <h4 className="font-semibold text-stone-800">{item.name}</h4>
                            <p className="text-sm text-stone-600 mb-2">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-green-700">${item.price}</span>
                              {item.allergens && item.allergens.length > 0 && (
                                <span className="text-xs text-amber-600">
                                  Contiene: {item.allergens.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Información de Barra Libre si está seleccionada */}
                    {selectedBarPackage && (
                      <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                        <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                          <TreePine className="w-5 h-5 text-green-700" />
                          Barra Libre Seleccionada
                        </h3>
                        {(() => {
                          const barPkg = barPackages.find(pkg => pkg.id === selectedBarPackage);
                          if (!barPkg) return null;

                          return (
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-stone-800">{barPkg.name}</h4>
                                <span className="text-xl font-bold text-green-700">${barPkg.pricePerPerson}/persona</span>
                              </div>
                              <p className="text-stone-600 mb-4">{barPkg.description}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="font-semibold text-stone-800 mb-2">Incluye:</h5>
                                  <ul className="text-sm text-stone-600 space-y-1">
                                    {barPkg.includes.map((item, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                {barPkg.restrictions && barPkg.restrictions.length > 0 && (
                                  <div>
                                    <h5 className="font-semibold text-stone-800 mb-2">Restricciones:</h5>
                                    <ul className="text-sm text-amber-700 space-y-1">
                                      {barPkg.restrictions.map((restriction, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                          {restriction}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Galería */}
      {showGallery && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
                  <Camera className="w-8 h-8 text-green-700" />
                  Galería del Restaurante Marlett
                </h2>
                <Button
                  onClick={() => setShowGallery(false)}
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Imagen Principal */}
              <div className="relative mb-6">
                <div className="relative h-96 bg-stone-100 rounded-2xl overflow-hidden">
                  <img 
                    src={salonImages[selectedImageIndex]?.url} 
                    alt={salonImages[selectedImageIndex]?.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <h3 className="text-xl font-semibold mb-2 text-white">{salonImages[selectedImageIndex]?.title}</h3>
                    <p className="text-stone-200">{salonImages[selectedImageIndex]?.description}</p>
                  </div>
                </div>
                
                {/* Controles de navegación */}
                <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                  <Button
                    onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : salonImages.length - 1)}
                    variant="outline"
                    size="sm"
                    className="h-12 w-12 p-0 bg-white/90 hover:bg-white"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                </div>
                
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                  <Button
                    onClick={() => setSelectedImageIndex(prev => prev < salonImages.length - 1 ? prev + 1 : 0)}
                    variant="outline"
                    size="sm"
                    className="h-12 w-12 p-0 bg-white/90 hover:bg-white"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              {/* Miniaturas */}
              <div className="grid grid-cols-5 gap-4">
                {salonImages.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-24 bg-stone-100 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                      selectedImageIndex === index ? 'ring-4 ring-green-500 scale-105' : 'hover:scale-105'
                    }`}
                  >
                    <img 
                      src={image.url} 
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-xs font-medium text-white text-center">{image.title.split(' ')[0]}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Información del salón actual */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-2">Sobre nuestras instalaciones:</h4>
                <p className="text-green-700 text-sm">
                  El Restaurante Marlett cuenta con espacios elegantes y modernos, diseñados para ofrecer 
                  experiencias gastronómicas excepcionales. Nuestros salones privados combinan tecnología 
                  de vanguardia con ambientes sofisticados para eventos inolvidables.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { 
  getEventTypesConfig, 
  updateEventTypesConfig,
  getDespechosEventsConfig,
  updateDespechosEventsConfig,
  getCapacityConfig,
  updateCapacityConfig,
  type EventTypeConfig,
  type DespechosEventConfig,
  type CapacityConfig
} from '@/lib/system-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Users,
  Clock,
  DollarSign,
  Star,
  Heart,
  Target,
  Crown,
  Gift,
  Music,
  Sparkles,
  AlertCircle,
  Check,
  Building2,
  Calendar,
  Zap
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Heart: <Heart className="w-5 h-5" />,
  Target: <Target className="w-5 h-5" />,
  Crown: <Crown className="w-5 h-5" />,
  Star: <Star className="w-5 h-5" />,
  Gift: <Gift className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Music: <Music className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
};

export default function AdminEventsPage() {
  const [eventTypes, setEventTypes] = useState<EventTypeConfig[]>([]);
  const [despechosEvents, setDespechosEvents] = useState<DespechosEventConfig[]>([]);
  const [capacityConfig, setCapacityConfig] = useState<CapacityConfig>(getCapacityConfig());
  const [activeTab, setActiveTab] = useState<'regular' | 'despechos' | 'capacity'>('regular');
  const [editingEvent, setEditingEvent] = useState<EventTypeConfig | DespechosEventConfig | null>(null);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setEventTypes(getEventTypesConfig());
    setDespechosEvents(getDespechosEventsConfig());
    setCapacityConfig(getCapacityConfig());
  }, []);

  const handleSaveEventType = (eventData: Partial<EventTypeConfig>) => {
    if (isNewEvent) {
      const newEvent: EventTypeConfig = {
        id: `event_${Date.now()}`,
        name: eventData.name || '',
        description: eventData.description || '',
        isActive: eventData.isActive ?? true,
        maxCapacity: eventData.maxCapacity || 50,
        minCapacity: eventData.minCapacity || 10,
        basePrice: eventData.basePrice || 30,
        hourlyRate: eventData.hourlyRate || 2000,
        minHours: eventData.minHours || 2,
        maxHours: eventData.maxHours || 6,
        requiresSpecialSetup: eventData.requiresSpecialSetup ?? false,
        specialRequirements: eventData.specialRequirements || [],
        cateringOptions: eventData.cateringOptions || [],
        decorationOptions: eventData.decorationOptions || [],
        audioVisualOptions: eventData.audioVisualOptions || [],
        icon: eventData.icon || 'Star',
        color: eventData.color || '#3b82f6'
      };
      
      const updatedEvents = [...eventTypes, newEvent];
      setEventTypes(updatedEvents);
      updateEventTypesConfig(updatedEvents);
    } else if (editingEvent) {
      const updatedEvents = eventTypes.map(event => 
        event.id === editingEvent.id ? { ...event, ...eventData } : event
      );
      setEventTypes(updatedEvents);
      updateEventTypesConfig(updatedEvents);
    }
    
    setEditingEvent(null);
    setIsNewEvent(false);
  };

  const handleSaveDespechosEvent = (eventData: Partial<DespechosEventConfig>) => {
    if (isNewEvent) {
      const newEvent: DespechosEventConfig = {
        id: `despechos_${Date.now()}`,
        name: eventData.name || '',
        description: eventData.description || '',
        isActive: eventData.isActive ?? true,
        maxCapacity: eventData.maxCapacity || 10,
        minCapacity: eventData.minCapacity || 1,
        coverPrice: eventData.coverPrice || 200,
        minHours: eventData.minHours || 1,
        maxHours: eventData.maxHours || 3,
        requiresSpecialSetup: eventData.requiresSpecialSetup ?? false,
        specialRequirements: eventData.specialRequirements || [],
        cateringOptions: eventData.cateringOptions || [],
        decorationOptions: eventData.decorationOptions || [],
        audioVisualOptions: eventData.audioVisualOptions || [],
        icon: eventData.icon || 'Users',
        color: eventData.color || '#ef4444',
        additionalCosts: eventData.additionalCosts || 0
      };
      
      const updatedEvents = [...despechosEvents, newEvent];
      setDespechosEvents(updatedEvents);
      updateDespechosEventsConfig(updatedEvents);
    } else if (editingEvent) {
      const updatedEvents = despechosEvents.map(event => 
        event.id === editingEvent.id ? { ...event, ...eventData } : event
      );
      setDespechosEvents(updatedEvents);
      updateDespechosEventsConfig(updatedEvents);
    }
    
    setEditingEvent(null);
    setIsNewEvent(false);
  };

  const handleDeleteEvent = (eventId: string, type: 'regular' | 'despechos') => {
    if (type === 'regular') {
      const updatedEvents = eventTypes.filter(event => event.id !== eventId);
      setEventTypes(updatedEvents);
      updateEventTypesConfig(updatedEvents);
    } else {
      const updatedEvents = despechosEvents.filter(event => event.id !== eventId);
      setDespechosEvents(updatedEvents);
      updateDespechosEventsConfig(updatedEvents);
    }
    setShowDeleteConfirm(null);
  };

  const handleCapacityUpdate = (updates: Partial<CapacityConfig>) => {
    const updated = { ...capacityConfig, ...updates };
    setCapacityConfig(updated);
    updateCapacityConfig(updated);
  };

  const parseArrayFromString = (str: string): string[] => {
    if (!str) return [];
    return str.split('\n').filter(item => item.trim() !== '');
  };

  const arrayToString = (arr: string[]): string => {
    return arr.join('\n');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600" />
              Administración de Eventos y Capacidad
            </h1>
            <p className="text-stone-600 mt-2">
              Gestiona los tipos de eventos, configuración de despechos y límites de capacidad
            </p>
          </div>
          <Button
            onClick={() => window.location.href = '/admin'}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            Volver a Admin
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('regular')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'regular'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-800'
            }`}
          >
            Eventos Regulares
          </button>
          <button
            onClick={() => setActiveTab('despechos')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'despechos'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-800'
            }`}
          >
            Marlett de Despechos
          </button>
          <button
            onClick={() => setActiveTab('capacity')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'capacity'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-800'
            }`}
          >
            Límites de Capacidad
          </button>
        </div>

        {/* Eventos Regulares */}
        {activeTab === 'regular' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-stone-800">Eventos Regulares</h2>
              <Button
                onClick={() => {
                  setEditingEvent(null);
                  setIsNewEvent(true);
                  setActiveTab('regular');
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nuevo Evento
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventTypes.map((event) => (
                <Card key={event.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: event.color + '20', color: event.color }}
                        >
                          {iconMap[event.icon] || <Star className="w-5 h-5" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{event.name}</CardTitle>
                          <Badge variant={event.isActive ? 'default' : 'secondary'}>
                            {event.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingEvent(event);
                            setIsNewEvent(false);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowDeleteConfirm(event.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-stone-600 text-sm mb-3">{event.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-stone-400" />
                        <span>{event.minCapacity}-{event.maxCapacity}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-stone-400" />
                        <span>${event.basePrice}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{event.minHours}-{event.maxHours}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        <span>{event.specialRequirements.length} requisitos</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Eventos de Despechos */}
        {activeTab === 'despechos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-stone-800">Marlett de Despechos</h2>
              <Button
                onClick={() => {
                  setEditingEvent(null);
                  setIsNewEvent(true);
                  setActiveTab('despechos');
                }}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                Nuevo Evento de Despechos
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {despechosEvents.map((event) => (
                <Card key={event.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: event.color + '20', color: event.color }}
                        >
                          {iconMap[event.icon] || <Users className="w-5 h-5" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{event.name}</CardTitle>
                          <Badge variant={event.isActive ? 'default' : 'secondary'}>
                            {event.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingEvent(event);
                            setIsNewEvent(false);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowDeleteConfirm(event.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-stone-600 text-sm mb-3">{event.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-stone-400" />
                        <span>{event.minCapacity}-{event.maxCapacity}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-stone-400" />
                        <span>${event.coverPrice}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{event.minHours}-{event.maxHours}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-stone-400" />
                        <span>+${event.additionalCosts}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Configuración de Capacidad */}
        {activeTab === 'capacity' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-stone-800">Límites de Capacidad</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Configuración Global de Capacidad
                </CardTitle>
                <CardDescription>
                  Establece los límites máximos para eventos y reservas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="maxGuestsPerEvent">Máximo de invitados por evento</Label>
                    <Input
                      id="maxGuestsPerEvent"
                      type="number"
                      value={capacityConfig.maxGuestsPerEvent}
                      onChange={(e) => handleCapacityUpdate({ 
                        maxGuestsPerEvent: parseInt(e.target.value) || 0 
                      })}
                      className="bg-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxEventsPerDay">Máximo de eventos por día</Label>
                    <Input
                      id="maxEventsPerDay"
                      type="number"
                      value={capacityConfig.maxEventsPerDay}
                      onChange={(e) => handleCapacityUpdate({ 
                        maxEventsPerDay: parseInt(e.target.value) || 0 
                      })}
                      className="bg-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxGuestsPerHour">Máximo de invitados por hora</Label>
                    <Input
                      id="maxGuestsPerHour"
                      type="number"
                      value={capacityConfig.maxGuestsPerHour}
                      onChange={(e) => handleCapacityUpdate({ 
                        maxGuestsPerHour: parseInt(e.target.value) || 0 
                      })}
                      className="bg-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="overbookingLimit">Límite de sobreventa (si está permitida)</Label>
                    <Input
                      id="overbookingLimit"
                      type="number"
                      value={capacityConfig.overbookingLimit}
                      onChange={(e) => handleCapacityUpdate({ 
                        overbookingLimit: parseInt(e.target.value) || 0 
                      })}
                      disabled={!capacityConfig.allowOverbooking}
                      className="bg-white"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowOverbooking"
                    checked={capacityConfig.allowOverbooking}
                    onChange={(e) => handleCapacityUpdate({ 
                      allowOverbooking: e.target.checked 
                    })}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-stone-300 rounded"
                  />
                  <Label htmlFor="allowOverbooking" className="text-sm">
                    Permitir sobreventa (reservas que excedan la capacidad)
                  </Label>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-800">Configuración Guardada</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Los cambios se aplican automáticamente en toda la aplicación.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de Edición */}
        {(editingEvent || isNewEvent) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-bold">
                  {isNewEvent 
                    ? `Nuevo ${activeTab === 'regular' ? 'Evento' : 'Evento de Despechos'}`
                    : 'Editar Evento'
                  }
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingEvent(null);
                    setIsNewEvent(false);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="p-6">
                <EventForm
                  event={editingEvent}
                  isNewEvent={isNewEvent}
                  eventType={activeTab}
                  onSave={activeTab === 'regular' ? handleSaveEventType : handleSaveDespechosEvent}
                  onCancel={() => {
                    setEditingEvent(null);
                    setIsNewEvent(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Confirmación de Eliminación */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold">Confirmar Eliminación</h3>
              </div>
              <p className="text-stone-600 mb-6">
                ¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => handleDeleteEvent(
                    showDeleteConfirm, 
                    activeTab === 'regular' ? 'regular' : 'despechos'
                  )}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de formulario para eventos
function EventForm({ 
  event, 
  isNewEvent, 
  eventType, 
  onSave, 
  onCancel 
}: {
  event: EventTypeConfig | DespechosEventConfig | null;
  isNewEvent: boolean;
  eventType: 'regular' | 'despechos';
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: event?.name || '',
    description: event?.description || '',
    isActive: event?.isActive ?? true,
    maxCapacity: event?.maxCapacity || 50,
    minCapacity: event?.minCapacity || 10,
    basePrice: event?.basePrice || (eventType === 'despechos' ? 0 : 30),
    coverPrice: (event as DespechosEventConfig)?.coverPrice || 200,
    hourlyRate: event?.hourlyRate || 2000,
    minHours: event?.minHours || 2,
    maxHours: event?.maxHours || 6,
    requiresSpecialSetup: event?.requiresSpecialSetup ?? false,
    specialRequirements: arrayToString(event?.specialRequirements || []),
    cateringOptions: arrayToString(event?.cateringOptions || []),
    decorationOptions: arrayToString(event?.decorationOptions || []),
    audioVisualOptions: arrayToString(event?.audioVisualOptions || []),
    icon: event?.icon || 'Star',
    color: event?.color || '#3b82f6',
    additionalCosts: (event as DespechosEventConfig)?.additionalCosts || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      specialRequirements: parseArrayFromString(formData.specialRequirements),
      cateringOptions: parseArrayFromString(formData.cateringOptions),
      decorationOptions: parseArrayFromString(formData.decorationOptions),
      audioVisualOptions: parseArrayFromString(formData.audioVisualOptions),
      basePrice: eventType === 'despechos' ? 0 : formData.basePrice
    };
    
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Evento</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            className="bg-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
            className="bg-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="minCapacity">Capacidad Mínima</Label>
          <Input
            id="minCapacity"
            type="number"
            value={formData.minCapacity}
            onChange={(e) => setFormData(prev => ({ ...prev, minCapacity: parseInt(e.target.value) }))}
            required
            className="bg-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="maxCapacity">Capacidad Máxima</Label>
          <Input
            id="maxCapacity"
            type="number"
            value={formData.maxCapacity}
            onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) }))}
            required
            className="bg-white"
          />
        </div>
        
        {eventType === 'regular' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="basePrice">Precio Base por Persona</Label>
              <Input
                id="basePrice"
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseInt(e.target.value) }))}
                required
                className="bg-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Tarifa por Hora</Label>
              <Input
                id="hourlyRate"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) }))}
                required
                className="bg-white"
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="coverPrice">Precio del Cover</Label>
              <Input
                id="coverPrice"
                type="number"
                value={formData.coverPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, coverPrice: parseInt(e.target.value) }))}
                required
                className="bg-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additionalCosts">Costos Adicionales</Label>
              <Input
                id="additionalCosts"
                type="number"
                value={formData.additionalCosts}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalCosts: parseInt(e.target.value) }))}
                className="bg-white"
              />
            </div>
          </>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="minHours">Horas Mínimas</Label>
          <Input
            id="minHours"
            type="number"
            step="0.5"
            value={formData.minHours}
            onChange={(e) => setFormData(prev => ({ ...prev, minHours: parseFloat(e.target.value) }))}
            required
            className="bg-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="maxHours">Horas Máximas</Label>
          <Input
            id="maxHours"
            type="number"
            step="0.5"
            value={formData.maxHours}
            onChange={(e) => setFormData(prev => ({ ...prev, maxHours: parseFloat(e.target.value) }))}
            required
            className="bg-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="icon">Icono</Label>
          <select
            id="icon"
            value={formData.icon}
            onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
            className="w-full h-10 px-3 border border-stone-200 rounded-md bg-white"
          >
            <option value="Heart">Heart</option>
            <option value="Target">Target</option>
            <option value="Crown">Crown</option>
            <option value="Star">Star</option>
            <option value="Gift">Gift</option>
            <option value="Users">Users</option>
            <option value="Music">Music</option>
            <option value="Sparkles">Sparkles</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            type="color"
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
            className="bg-white h-10"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="specialRequirements">Requisitos Especiales (uno por línea)</Label>
          <Textarea
            id="specialRequirements"
            value={formData.specialRequirements}
            onChange={(e) => setFormData(prev => ({ ...prev, specialRequirements: e.target.value }))}
            rows={3}
            className="bg-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cateringOptions">Opciones de Catering (uno por línea)</Label>
          <Textarea
            id="cateringOptions"
            value={formData.cateringOptions}
            onChange={(e) => setFormData(prev => ({ ...prev, cateringOptions: e.target.value }))}
            rows={3}
            className="bg-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="decorationOptions">Opciones de Decoración (uno por línea)</Label>
          <Textarea
            id="decorationOptions"
            value={formData.decorationOptions}
            onChange={(e) => setFormData(prev => ({ ...prev, decorationOptions: e.target.value }))}
            rows={3}
            className="bg-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="audioVisualOptions">Opciones Audio/Visual (uno por línea)</Label>
          <Textarea
            id="audioVisualOptions"
            value={formData.audioVisualOptions}
            onChange={(e) => setFormData(prev => ({ ...prev, audioVisualOptions: e.target.value }))}
            rows={3}
            className="bg-white"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-stone-300 rounded"
        />
        <Label htmlFor="isActive">Evento activo</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="requiresSpecialSetup"
          checked={formData.requiresSpecialSetup}
          onChange={(e) => setFormData(prev => ({ ...prev, requiresSpecialSetup: e.target.checked }))}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-stone-300 rounded"
        />
        <Label htmlFor="requiresSpecialSetup">Requiere configuración especial</Label>
      </div>
      
      <div className="flex gap-3 justify-end pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {isNewEvent ? 'Crear Evento' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
}

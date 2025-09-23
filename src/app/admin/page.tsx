'use client';

import { useState, useEffect } from 'react';
import { 
  getReservations,
  getStatusColor,
  getStatusText,
  type Reservation,
  type PricingConfig,
  fetchReservationsAsync,
  updateReservationAsync,
  deleteReservationAsync,
  getPricingConfig,
  getPricingConfigAsync,
  updatePricingConfigAsync
} from '@/lib/reservations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Calendar,
  Clock,
  Users,
  DollarSign,
  Edit,
  Trash2,
  X,
  Check,
  AlertCircle,
  Settings,
  Eye,
  Filter,
  Download,
  BarChart3,
  TrendingUp,
  Building2,
  Star,
  Heart,
  Target,
  Crown,
  Gift
} from 'lucide-react';

import { downloadReservationPdf } from '@/lib/utils'
import DownloadPDF from '@/components/DownloadPDF'
import ExportData from '@/components/ExportData'
import ReservationsTable from '@/components/ReservationsTable'
// Interface Reservation importada desde @/lib/reservations

export default function AdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Cargar reservas desde el sistema compartido
  useEffect(() => {
    fetchReservationsAsync().then(setReservations).catch(() => setReservations(getReservations()));
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPricingConfig, setShowPricingConfig] = useState(false);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    salones: 900,
    catering: 15,
    decoracion: 8,
    audioVisual: 5,
    setup: 200,
    hourlyRate: 3000
  });

  // Cargar configuración de precios
  useEffect(() => {
    getPricingConfigAsync().then(setPricingConfig).catch(() => setPricingConfig(getPricingConfig()));
  }, []);

  // Función para eliminar eventos pasados automáticamente
  useEffect(() => {
    const cleanupPastEvents = () => {
      const today = new Date();
      const todayString = today.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      });
      
      setReservations(prev => {
        const filtered = prev.filter(reservation => {
          const [day, month, year] = reservation.date.split('/');
          const eventDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          return eventDate >= today;
        });
        
        if (filtered.length < prev.length) {
          console.log(`Eliminados ${prev.length - filtered.length} eventos pasados automáticamente`);
        }
        
        return filtered;
      });
    };

    // Ejecutar limpieza al cargar la página
    cleanupPastEvents();
    
    // Ejecutar limpieza cada hora
    const interval = setInterval(cleanupPastEvents, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Funciones getStatusColor y getStatusText importadas desde @/lib/reservations

  const updateReservationStatus = (id: string, newStatus: 'confirmed' | 'pending' | 'cancelled' | 'in-progress' | 'completed') => {
    updateReservationAsync(id, { status: newStatus })
      .then(() => fetchReservationsAsync().then(setReservations))
      .catch(() => setReservations(getReservations()));
  };

  const deleteReservation = (id: string) => {
    deleteReservationAsync(id)
      .then(() => fetchReservationsAsync().then(setReservations))
      .catch(() => setReservations(getReservations()));
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reservation.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reservation.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    pending: reservations.filter(r => r.status === 'pending').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    inProgress: reservations.filter(r => r.status === 'in-progress').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    totalRevenue: reservations.filter(r => r.status === 'confirmed' || r.status === 'completed').reduce((sum, r) => sum + r.totalPrice, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100">
      {/* Header Admin */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-800 via-stone-700 to-stone-600"></div>
        <div className="relative z-10 backdrop-blur-xl bg-white/10 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-48 h-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300 border border-white/20">
                    <img 
                      src="/Mdorado.svg" 
                      alt="Dorado Logo" 
                      className="w-40 h-12 object-contain"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-5xl font-bold text-white mb-2">Panel de Administración</h1>
                  <p className="text-stone-100 text-lg font-medium">
                    Gestión completa de reservas y eventos
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setShowPricingConfig(true)}
                  className="bg-amber-500/20 backdrop-blur-xl border border-amber-300/30 text-white hover:bg-amber-500/30 transition-all duration-300"
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  Configurar Precios
                </Button>
                
                <Button
                  onClick={() => window.location.href = '/'}
                  className="bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 transition-all duration-300"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Vista Cliente
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-12">
          <Card className="bg-white/90 backdrop-blur-xl border-stone-200 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-stone-600 to-stone-700 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-800">{stats.total}</p>
                  <p className="text-stone-600">Total Reservas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-stone-200 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-700 to-green-800 rounded-xl flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-800">{stats.confirmed}</p>
                  <p className="text-stone-600">Confirmadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-stone-200 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-800">{stats.pending}</p>
                  <p className="text-stone-600">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-stone-200 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                  <X className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-800">{stats.cancelled}</p>
                  <p className="text-stone-600">Canceladas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-stone-200 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-800">{stats.inProgress}</p>
                  <p className="text-stone-600">En Proceso</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-stone-200 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-800">{stats.completed}</p>
                  <p className="text-stone-600">Finalizados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-stone-200 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-700 to-green-800 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-800">${stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-stone-600">Ingresos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Control */}
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden mb-8">
          <CardHeader className="bg-gradient-to-r from-stone-700 to-stone-800 text-white p-8">
            <CardTitle className="text-3xl font-bold flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Settings className="w-6 h-6" />
              </div>
              Gestión de Reservas
            </CardTitle>
            <CardDescription className="text-stone-100 text-lg">
              Administra, monitorea y controla todas las reservas del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {/* Filtros y Búsqueda */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-stone-700 font-semibold">
                  Buscar Reservas
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                  <Input
                    id="search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nombre, email, tipo de evento..."
                    className="pl-12 h-12 bg-stone-50 border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-stone-700 font-semibold">
                  Filtrar por Estado
                </Label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-12 w-full bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-600 px-3"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="confirmed">Confirmadas</option>
                  <option value="pending">Pendientes</option>
                  <option value="in-progress">En Proceso</option>
                  <option value="completed">Finalizadas</option>
                  <option value="cancelled">Canceladas</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-stone-700 font-semibold">Acciones Rápidas</Label>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setSearchQuery(new Date().toLocaleDateString('es-ES'))}
                    variant="outline"
                    className="flex-1"
                  >
                    Hoy
                  </Button>
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
            </div>

            {/* Lista de Reservas: tabla con export */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-stone-800">Reservas</h3>
              <ExportData data={filteredReservations} />
            </div>
            <div className="space-y-6">
              {filteredReservations.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
                  <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-stone-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-stone-800 mb-2">Sin Resultados</h3>
                  <p className="text-stone-600">
                    No se encontraron reservas que coincidan con los filtros aplicados.
                  </p>
                </div>
              ) : (
                <ReservationsTable reservations={filteredReservations} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edición */}
      {showEditModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-stone-800">Editar Reserva - {selectedReservation.name}</h2>
                <Button
                  onClick={() => setShowEditModal(false)}
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Información del Cliente */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-stone-800">Información del Cliente</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-name">Nombre</Label>
                      <Input
                        id="edit-name"
                        defaultValue={selectedReservation.name}
                        className="h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        defaultValue={selectedReservation.email}
                        className="h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-phone">Teléfono</Label>
                      <Input
                        id="edit-phone"
                        defaultValue={selectedReservation.phone}
                        className="h-12"
                      />
                    </div>
                  </div>
                </div>

                {/* Detalles del Evento */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-stone-800">Detalles del Evento</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-date">Fecha</Label>
                        <Input
                          id="edit-date"
                          type="date"
                          defaultValue={selectedReservation.date.split('/').reverse().join('-')}
                          className="h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-time">Hora</Label>
                        <Input
                          id="edit-time"
                          type="time"
                          defaultValue={selectedReservation.time}
                          className="h-12"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-guests">Invitados</Label>
                        <Input
                          id="edit-guests"
                          type="number"
                          defaultValue={selectedReservation.guests}
                          className="h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-duration">Duración (horas)</Label>
                        <Input
                          id="edit-duration"
                          type="number"
                          defaultValue={selectedReservation.duration}
                          className="h-12"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-status">Estado</Label>
                      <select
                        id="edit-status"
                        defaultValue={selectedReservation.status}
                        onChange={(e) => updateReservationStatus(selectedReservation.id, e.target.value as any)}
                        className="h-12 w-full bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-600 px-3"
                      >
                        <option value="confirmed">Confirmada</option>
                        <option value="pending">Pendiente</option>
                        <option value="in-progress">En Proceso</option>
                        <option value="completed">Finalizada</option>
                        <option value="cancelled">Cancelada</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-stone-200">
                <Button
                  onClick={() => setShowEditModal(false)}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    // Aquí iría la lógica para guardar cambios
                    setShowEditModal(false);
                  }}
                  className="bg-green-700 hover:bg-green-800"
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuración de Precios */}
      {showPricingConfig && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-amber-600" />
                  Configuración de Precios
                </h2>
                <Button
                  onClick={() => setShowPricingConfig(false)}
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-8">
                {/* Información */}
                <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-amber-800 mb-2">Configuración de Precios del Sistema</h3>
                      <p className="text-sm text-amber-700">
                        Estos precios se aplicarán automáticamente a todas las nuevas reservas y se reflejarán en la página de eventos.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Configuración de Precios */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-stone-800">Servicios Base</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="salones-price" className="text-stone-700 font-semibold">
                          Salones (por salón)
                        </Label>
                        <div className="relative mt-2">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                          <Input
                            id="salones-price"
                            type="number"
                            value={pricingConfig.salones}
                            onChange={(e) => setPricingConfig(prev => ({...prev, salones: parseInt(e.target.value) || 0}))}
                            className="pl-12 h-12 text-lg font-semibold"
                            min="0"
                            step="50"
                          />
                        </div>
                        <p className="text-xs text-stone-500 mt-1">Precio base por salón utilizado</p>
                      </div>

                      <div>
                        <Label htmlFor="catering-price" className="text-stone-700 font-semibold">
                          Catering (por persona)
                        </Label>
                        <div className="relative mt-2">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                          <Input
                            id="catering-price"
                            type="number"
                            value={pricingConfig.catering}
                            onChange={(e) => setPricingConfig(prev => ({...prev, catering: parseInt(e.target.value) || 0}))}
                            className="pl-12 h-12 text-lg font-semibold"
                            min="0"
                            step="1"
                          />
                        </div>
                        <p className="text-xs text-stone-500 mt-1">Costo de catering por invitado</p>
                      </div>

                      <div>
                        <Label htmlFor="decoracion-price" className="text-stone-700 font-semibold">
                          Decoración (por persona)
                        </Label>
                        <div className="relative mt-2">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                          <Input
                            id="decoracion-price"
                            type="number"
                            value={pricingConfig.decoracion}
                            onChange={(e) => setPricingConfig(prev => ({...prev, decoracion: parseInt(e.target.value) || 0}))}
                            className="pl-12 h-12 text-lg font-semibold"
                            min="0"
                            step="1"
                          />
                        </div>
                        <p className="text-xs text-stone-500 mt-1">Costo de decoración por invitado</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-stone-800">Servicios Adicionales</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="audiovisual-price" className="text-stone-700 font-semibold">
                          Audio/Visual (por persona)
                        </Label>
                        <div className="relative mt-2">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                          <Input
                            id="audiovisual-price"
                            type="number"
                            value={pricingConfig.audioVisual}
                            onChange={(e) => setPricingConfig(prev => ({...prev, audioVisual: parseInt(e.target.value) || 0}))}
                            className="pl-12 h-12 text-lg font-semibold"
                            min="0"
                            step="1"
                          />
                        </div>
                        <p className="text-xs text-stone-500 mt-1">Costo de audio/visual por invitado</p>
                      </div>

                      <div>
                        <Label htmlFor="setup-price" className="text-stone-700 font-semibold">
                          Setup Especial (fijo)
                        </Label>
                        <div className="relative mt-2">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                          <Input
                            id="setup-price"
                            type="number"
                            value={pricingConfig.setup}
                            onChange={(e) => setPricingConfig(prev => ({...prev, setup: parseInt(e.target.value) || 0}))}
                            className="pl-12 h-12 text-lg font-semibold"
                            min="0"
                            step="50"
                          />
                        </div>
                        <p className="text-xs text-stone-500 mt-1">Costo fijo para configuraciones especiales</p>
                      </div>

                      <div>
                        <Label htmlFor="hourly-rate" className="text-stone-700 font-semibold">
                          Tarifa por Hora
                        </Label>
                        <div className="relative mt-2">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                          <Input
                            id="hourly-rate"
                            type="number"
                            value={pricingConfig.hourlyRate}
                            onChange={(e) => setPricingConfig(prev => ({...prev, hourlyRate: parseInt(e.target.value) || 0}))}
                            className="pl-12 h-12 text-lg font-semibold"
                            min="0"
                            step="100"
                          />
                        </div>
                        <p className="text-xs text-stone-500 mt-1">Tarifa base por hora para todos los eventos</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vista Previa del Cálculo */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-green-800 mb-4">Vista Previa - Evento de 100 personas, 4 horas</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-green-700">Salones (2): ${(pricingConfig.salones * 2).toLocaleString()}</p>
                      <p className="text-green-700 font-semibold">Horas: ${(pricingConfig.hourlyRate * 4).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-green-700">Catering: ${(pricingConfig.catering * 100).toLocaleString()}</p>
                      <p className="text-green-700">Decoración: ${(pricingConfig.decoracion * 100).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-green-700">Audio/Visual: ${(pricingConfig.audioVisual * 100).toLocaleString()}</p>
                      <p className="text-green-700">Setup: ${pricingConfig.setup.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-bold text-green-800">
                        Total: ${(pricingConfig.salones * 2 + pricingConfig.hourlyRate * 4 + pricingConfig.catering * 100 + pricingConfig.decoracion * 100 + pricingConfig.audioVisual * 100 + pricingConfig.setup).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex justify-between items-center pt-6 border-t border-stone-200">
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setPricingConfig({
                          salones: 900,
                          catering: 15,
                          decoracion: 8,
                          audioVisual: 5,
                          setup: 200,
                          hourlyRate: 3000
                        });
                      }}
                      variant="outline"
                      className="border-stone-300 text-stone-700"
                    >
                      Restaurar Valores por Defecto
                    </Button>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button
                      onClick={() => setShowPricingConfig(false)}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        updatePricingConfigAsync(pricingConfig)
                          .then(() => setShowPricingConfig(false))
                          .catch(() => setShowPricingConfig(false));
                        alert('Configuración de precios actualizada correctamente.');
                      }}
                      className="bg-green-700 hover:bg-green-800"
                    >
                      Guardar Cambios
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

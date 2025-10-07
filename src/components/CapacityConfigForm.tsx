'use client';

import { useState, useEffect } from 'react';
import { 
  getIndividualCapacityConfig, 
  updateIndividualCapacityConfig,
  type IndividualCapacityConfig 
} from '@/lib/system-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  Check,
  Save,
  Building2,
  Music
} from 'lucide-react';

interface CapacityConfigFormProps {
  onClose: () => void;
}

export default function CapacityConfigForm({ onClose }: CapacityConfigFormProps) {
  const [config, setConfig] = useState<IndividualCapacityConfig>(getIndividualCapacityConfig());
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const currentConfig = getIndividualCapacityConfig();
    setConfig(currentConfig);
  }, []);

  const handleUpdate = (section: 'regularEvents' | 'despechosEvents', field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateIndividualCapacityConfig(config);
    setHasChanges(false);
    // Opcional: mostrar mensaje de éxito
  };

  const renderCapacitySection = (
    title: string,
    icon: React.ReactNode,
    section: 'regularEvents' | 'despechosEvents',
    sectionData: IndividualCapacityConfig['regularEvents']
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>
          Configura los límites específicos para {title.toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor={`${section}-maxGuestsPerEvent`}>
              <Users className="w-4 h-4 inline mr-2" />
              Máximo de invitados por evento
            </Label>
            <Input
              id={`${section}-maxGuestsPerEvent`}
              type="number"
              value={sectionData.maxGuestsPerEvent}
              onChange={(e) => handleUpdate(section, 'maxGuestsPerEvent', parseInt(e.target.value) || 0)}
              className="bg-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`${section}-maxEventsPerDay`}>
              <Calendar className="w-4 h-4 inline mr-2" />
              Máximo de eventos por día
            </Label>
            <Input
              id={`${section}-maxEventsPerDay`}
              type="number"
              value={sectionData.maxEventsPerDay}
              onChange={(e) => handleUpdate(section, 'maxEventsPerDay', parseInt(e.target.value) || 0)}
              className="bg-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`${section}-maxGuestsPerHour`}>
              <Clock className="w-4 h-4 inline mr-2" />
              Máximo de invitados por hora
            </Label>
            <Input
              id={`${section}-maxGuestsPerHour`}
              type="number"
              value={sectionData.maxGuestsPerHour}
              onChange={(e) => handleUpdate(section, 'maxGuestsPerHour', parseInt(e.target.value) || 0)}
              className="bg-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`${section}-overbookingLimit`}>
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Límite de sobreventa
            </Label>
            <Input
              id={`${section}-overbookingLimit`}
              type="number"
              value={sectionData.overbookingLimit}
              onChange={(e) => handleUpdate(section, 'overbookingLimit', parseInt(e.target.value) || 0)}
              disabled={!sectionData.allowOverbooking}
              className="bg-white"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`${section}-allowOverbooking`}
            checked={sectionData.allowOverbooking}
            onChange={(e) => handleUpdate(section, 'allowOverbooking', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-stone-300 rounded"
          />
          <Label htmlFor={`${section}-allowOverbooking`} className="text-sm">
            Permitir sobreventa (reservas que excedan la capacidad)
          </Label>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-800">Configuración Actual</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <strong>Invitados por evento:</strong> {sectionData.maxGuestsPerEvent}
            </div>
            <div>
              <strong>Eventos por día:</strong> {sectionData.maxEventsPerDay}
            </div>
            <div>
              <strong>Invitados por hora:</strong> {sectionData.maxGuestsPerHour}
            </div>
            <div>
              <strong>Sobreventa:</strong> {sectionData.allowOverbooking ? 'Permitida' : 'No permitida'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Configuración de Límites de Capacidad</h2>
          <p className="text-stone-600 mt-2">
            Establece límites específicos para cada tipo de evento
          </p>
        </div>
        <div className="flex gap-3">
          {hasChanges && (
            <Button
              onClick={handleSave}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar Cambios
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="outline"
          >
            Cerrar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderCapacitySection(
          'Eventos Regulares',
          <Building2 className="w-6 h-6 text-blue-600" />,
          'regularEvents',
          config.regularEvents
        )}
        
        {renderCapacitySection(
          'Marlett de Despechos',
          <Music className="w-6 h-6 text-purple-600" />,
          'despechosEvents',
          config.despechosEvents
        )}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Check className="w-4 h-4 text-green-600" />
          <span className="font-semibold text-green-800">Información</span>
        </div>
        <p className="text-sm text-green-700">
          Los límites configurados aquí se aplican automáticamente en toda la aplicación. 
          Las validaciones se realizan en tiempo real durante el proceso de reserva.
        </p>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { threatService } from '../services/api';
import { Threat } from '../types';
import { 
  Shield, 
  Search, 
  Filter, 
  Globe, 
  Clock, 
  Target,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  X
} from 'lucide-react';

interface FilterState {
  severity: string;
  type: string;
  minConfidence: number;
  source: string;
  search: string;
}

const ThreatIntel: React.FC = () => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [filteredThreats, setFilteredThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    severity: '',
    type: '',
    minConfidence: 0,
    source: '',
    search: ''
  });

  useEffect(() => {
    loadThreats();
    loadStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threats, filters]);

  const loadThreats = async () => {
    try {
      const response = await threatService.getAllThreats();
      if (response.success) {
        setThreats(response.data);
      }
    } catch (error) {
      console.error('Error loading threats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await threatService.getThreatStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading threat stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...threats];

    if (filters.search) {
      filtered = filtered.filter(threat => 
        threat.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        threat.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        threat.type.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.severity) {
      filtered = filtered.filter(threat => threat.severity === filters.severity);
    }

    if (filters.type) {
      filtered = filtered.filter(threat => threat.type.toLowerCase().includes(filters.type.toLowerCase()));
    }

    if (filters.minConfidence > 0) {
      filtered = filtered.filter(threat => threat.confidence >= filters.minConfidence);
    }

    if (filters.source) {
      filtered = filtered.filter(threat => threat.source.toLowerCase().includes(filters.source.toLowerCase()));
    }

    setFilteredThreats(filtered.sort((a, b) => {
      // Ordenar por severidad y luego por confianza
      const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const severityDiff = (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
                          (severityOrder[a.severity as keyof typeof severityOrder] || 0);
      
      if (severityDiff !== 0) return severityDiff;
      return b.confidence - a.confidence;
    }));
  };

  // Helper functions commented out to avoid unused variable warnings - each component defines its own
  /*
  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      'critical': 'bg-red-500',
      'high': 'bg-orange-500',
      'medium': 'bg-yellow-500',
      'low': 'bg-blue-500'
    };
    return colors[severity] || colors['low'];
  };

  const getSeverityBgColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      'critical': 'bg-red-100 text-red-800 border-red-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'low': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[severity] || colors['low'];
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
    if (confidence >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };
  */

  const resetFilters = () => {
    setFilters({
      severity: '',
      type: '',
      minConfidence: 0,
      source: '',
      search: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
          <span className="text-lg text-gray-600">Cargando inteligencia de amenazas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inteligencia de Amenazas</h1>
          <p className="text-gray-600 mt-1">
            Monitoreo y análisis de amenazas globales ({filteredThreats.length} de {threats.length})
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={loadThreats}
            className="btn-primary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Amenazas Totales</h3>
              <Shield className="w-5 h-5 text-primary-500" />
            </div>
            <div className="text-3xl font-bold text-primary-600">{stats.totalThreats || threats.length}</div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Alta Severidad</h3>
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-600">
              {threats.filter(t => t.severity === 'critical' || t.severity === 'high').length}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Alta Confianza</h3>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">
              {threats.filter(t => t.confidence >= 80).length}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Fuentes Activas</h3>
              <Globe className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {new Set(threats.map(t => t.source)).size}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>{showFilters ? 'Ocultar' : 'Mostrar'} Filtros</span>
          </button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar amenazas por nombre, descripción o tipo..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="form-select"
            >
              <option value="">Todas las severidades</option>
              <option value="critical">Crítica</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>

            <input
              type="text"
              placeholder="Tipo de amenaza"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="form-input"
            />

            <input
              type="number"
              placeholder="Confianza mínima %"
              min="0"
              max="100"
              value={filters.minConfidence || ''}
              onChange={(e) => setFilters({ ...filters, minConfidence: Number(e.target.value) || 0 })}
              className="form-input"
            />

            <input
              type="text"
              placeholder="Fuente"
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="form-input"
            />

            <button
              onClick={resetFilters}
              className="btn-secondary flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Limpiar</span>
            </button>
          </div>
        )}
      </div>

      {/* Threats List */}
      <div className="space-y-4">
        {filteredThreats.length === 0 ? (
          <div className="card text-center py-12">
            <Shield className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron amenazas</h3>
            <p className="text-gray-600">
              {threats.length === 0 
                ? 'No hay amenazas en la base de datos' 
                : 'No hay amenazas que coincidan con los filtros aplicados'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredThreats.map((threat) => (
              <ThreatCard 
                key={threat.id} 
                threat={threat} 
                onClick={() => setSelectedThreat(threat)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Threat Detail Modal */}
      {selectedThreat && (
        <ThreatDetailModal 
          threat={selectedThreat}
          onClose={() => setSelectedThreat(null)}
        />
      )}
    </div>
  );
};

interface ThreatCardProps {
  threat: Threat;
  onClick: () => void;
}

const ThreatCard: React.FC<ThreatCardProps> = ({ threat, onClick }) => {
  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      'critical': 'bg-red-500',
      'high': 'bg-orange-500',
      'medium': 'bg-yellow-500',
      'low': 'bg-blue-500'
    };
    return colors[severity] || colors['low'];
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
    if (confidence >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div 
      className="card hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className={`w-3 h-3 rounded-full ${getSeverityColor(threat.severity)} mt-1`}></div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">{threat.name}</h3>
            <p className="text-sm text-gray-600 capitalize">{threat.type}</p>
          </div>
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(threat.confidence)}`}>
          {threat.confidence}% confianza
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm mb-4 line-clamp-3">{threat.description}</p>

      {/* Indicators */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Indicadores ({threat.indicators.length})</h4>
        <div className="flex flex-wrap gap-1">
          {threat.indicators.slice(0, 3).map((indicator, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-mono"
            >
              {indicator.length > 20 ? `${indicator.slice(0, 20)}...` : indicator}
            </span>
          ))}
          {threat.indicators.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              +{threat.indicators.length - 3} más
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Globe className="w-3 h-3" />
            <span>{threat.source}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{new Date(threat.lastSeen).toLocaleDateString('es-ES')}</span>
          </div>
        </div>

        <button className="text-primary-600 hover:text-primary-700 flex items-center space-x-1">
          <span>Ver detalle</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

interface ThreatDetailModalProps {
  threat: Threat;
  onClose: () => void;
}

const ThreatDetailModal: React.FC<ThreatDetailModalProps> = ({ threat, onClose }) => {
  // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);
  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      'critical': 'bg-red-100 text-red-800 border-red-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'low': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[severity] || colors['low'];
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
    if (confidence >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose} // Cerrar al hacer clic en el fondo
    >
      <div 
        className="bg-white rounded-lg max-w-md w-full max-h-[85vh] overflow-hidden shadow-xl mx-2"
        onClick={(e) => e.stopPropagation()} // Evitar cerrar al hacer clic dentro del modal
      >
        {/* Header fijo */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <Target className="w-4 h-4 text-red-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-gray-900 truncate">{threat.name}</h2>
                <p className="text-gray-600 capitalize text-xs">{threat.type}</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              title="Cerrar"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="overflow-y-auto max-h-[calc(85vh-60px)] p-3">
          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className={`p-2 rounded border ${getSeverityColor(threat.severity)}`}>
              <div className="text-center">
                <div className="text-sm font-bold">{threat.severity.toUpperCase()}</div>
                <div className="text-xs">Severidad</div>
              </div>
            </div>

            <div className={`p-2 rounded border ${getConfidenceColor(threat.confidence)}`}>
              <div className="text-center">
                <div className="text-sm font-bold">{threat.confidence}%</div>
                <div className="text-xs">Confianza</div>
              </div>
            </div>

            <div className="p-2 rounded border bg-gray-100 text-gray-800 border-gray-200">
              <div className="text-center">
                <div className="text-sm font-bold">{threat.indicators.length}</div>
                <div className="text-xs">Indicadores</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Descripción</h3>
              <p className="text-gray-700 text-xs">{threat.description}</p>
            </div>

            {/* Indicators */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Indicadores ({threat.indicators.length})
              </h3>
              <div className="space-y-1">
                {threat.indicators.slice(0, 3).map((indicator, index) => (
                  <div 
                    key={index}
                    className="p-1 bg-gray-50 rounded text-xs font-mono break-all"
                  >
                    {indicator.length > 40 ? `${indicator.slice(0, 40)}...` : indicator}
                  </div>
                ))}
                {threat.indicators.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{threat.indicators.length - 3} más...
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-2">
              <div>
                <h4 className="text-xs font-semibold text-gray-900">Fuente</h4>
                <p className="text-gray-700 text-xs">{threat.source}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-900">Última observación</h4>
                <p className="text-gray-700 text-xs">{new Date(threat.lastSeen).toLocaleString('es-ES')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatIntel;

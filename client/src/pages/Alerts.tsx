import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { alertService } from '../services/api';
import { Alert } from '../types';
import { 
  AlertTriangle, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Filter,
  Search,
  Archive,
  Eye,
  MoreVertical,
  MapPin,
  Zap
} from 'lucide-react';

interface FilterState {
  severity: string;
  status: string;
  type: string;
  search: string;
}

const Alerts: React.FC = () => {
  const { alerts: socketAlerts } = useSocket();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    severity: '',
    status: '',
    type: '',
    search: ''
  });

  useEffect(() => {
    loadAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (socketAlerts.length > 0) {
      setAlerts(socketAlerts);
      applyFilters(socketAlerts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketAlerts, filters]);

  const loadAlerts = async () => {
    try {
      const response = await alertService.getRecentAlerts(100);
      if (response.success) {
        setAlerts(response.data);
        applyFilters(response.data);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (alertsToFilter: Alert[]) => {
    let filtered = [...alertsToFilter];

    if (filters.search) {
      filtered = filtered.filter(alert => 
        alert.message.toLowerCase().includes(filters.search.toLowerCase()) ||
        alert.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        alert.source.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.severity) {
      filtered = filtered.filter(alert => alert.severity === filters.severity);
    }

    if (filters.status) {
      filtered = filtered.filter(alert => alert.status === filters.status);
    }

    if (filters.type) {
      filtered = filtered.filter(alert => alert.type === filters.type);
    }

    setFilteredAlerts(filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.timestamp || (a as any).detection_time);
      const dateB = new Date(b.createdAt || b.timestamp || (b as any).detection_time);
      
      // Si alguna fecha es inválida, ponerla al final
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      
      return dateB.getTime() - dateA.getTime();
    }));
  };

  const handleUpdateAlert = async (alertId: string, updates: Partial<Alert>) => {
    try {
      if (updates.status) {
        await alertService.updateAlertStatus(alertId, updates.status, updates);
      }
      loadAlerts();
    } catch (error) {
      console.error('Error updating alert:', error);
    }
  };

  // Helper functions commented out to avoid unused variable warnings
  /*
  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      'critical': 'bg-red-100 text-red-800 border-red-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'low': 'bg-blue-100 text-blue-800 border-blue-200',
      'info': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[severity] || colors['info'];
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'low':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'investigating':
        return <Eye className="w-4 h-4 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'dismissed':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };
  */

  const resetFilters = () => {
    setFilters({
      severity: '',
      status: '',
      type: '',
      search: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span className="text-lg text-gray-600">Cargando alertas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alertas de Seguridad</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las alertas del sistema ({filteredAlerts.length} de {alerts.length})
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>{alerts.filter(a => a.severity === 'critical').length} Críticas</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>{alerts.filter(a => a.severity === 'high').length} Altas</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>{alerts.filter(a => a.status === 'resolved').length} Resueltas</span>
            </div>
          </div>
        </div>
      </div>

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
              placeholder="Buscar en título, mensaje o fuente..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <option value="info">Info</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="form-select"
            >
              <option value="">Todos los estados</option>
              <option value="open">Abierta</option>
              <option value="investigating">Investigando</option>
              <option value="resolved">Resuelta</option>
              <option value="dismissed">Descartada</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="form-select"
            >
              <option value="">Todos los tipos</option>
              <option value="intrusion">Intrusión</option>
              <option value="malware">Malware</option>
              <option value="vulnerability">Vulnerabilidad</option>
              <option value="policy_violation">Violación de Política</option>
              <option value="anomaly">Anomalía</option>
              <option value="system">Sistema</option>
            </select>

            <button
              onClick={resetFilters}
              className="btn-secondary flex items-center justify-center space-x-2"
            >
              <Archive className="w-4 h-4" />
              <span>Limpiar</span>
            </button>
          </div>
        )}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="card text-center py-12">
            <Shield className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron alertas</h3>
            <p className="text-gray-600">
              {alerts.length === 0 
                ? 'No hay alertas en el sistema' 
                : 'No hay alertas que coincidan con los filtros aplicados'}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertCard 
              key={alert._id} 
              alert={alert} 
              onUpdate={handleUpdateAlert}
              onClick={() => setSelectedAlert(alert)}
            />
          ))
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <AlertDetailModal 
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onUpdate={handleUpdateAlert}
        />
      )}
    </div>
  );
};

interface AlertCardProps {
  alert: Alert;
  onUpdate: (alertId: string, updates: Partial<Alert>) => void;
  onClick: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onUpdate, onClick }) => {
  const [showActions, setShowActions] = useState(false);

  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      'critical': 'bg-red-100 text-red-800 border-red-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'low': 'bg-blue-100 text-blue-800 border-blue-200',
      'info': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[severity] || colors['info'];
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'low':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'investigating':
        return <Eye className="w-4 h-4 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'dismissed':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow cursor-pointer relative" onClick={onClick}>
      <div className="flex items-start space-x-4">
        {/* Severity indicator */}
        <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
          {getSeverityIcon(alert.severity)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">{alert.message}</h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{alert.description || 'Sin descripción adicional'}</p>
            </div>

            {/* Actions */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate(alert._id, { status: 'investigating' });
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Investigar</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate(alert._id, { status: 'resolved' });
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Resolver</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate(alert._id, { status: 'closed' });
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cerrar</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Meta info */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              {getStatusIcon(alert.status)}
              <span className="capitalize">{alert.status}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Zap className="w-4 h-4" />
              <span>{alert.source}</span>
            </div>

            {alert.geolocation && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{alert.geolocation.country} - {alert.geolocation.region}</span>
              </div>
            )}

            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>
                {new Date(alert.createdAt).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AlertDetailModalProps {
  alert: Alert;
  onClose: () => void;
  onUpdate: (alertId: string, updates: Partial<Alert>) => void;
}

const AlertDetailModal: React.FC<AlertDetailModalProps> = ({ alert, onClose, onUpdate }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${alert.severity === 'critical' ? 'bg-red-100' : alert.severity === 'high' ? 'bg-orange-100' : 'bg-yellow-100'}`}>
                <AlertTriangle className={`w-6 h-6 ${alert.severity === 'critical' ? 'text-red-600' : alert.severity === 'high' ? 'text-orange-600' : 'text-yellow-600'}`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{alert.message}</h2>
                <p className="text-sm text-gray-600">ID: {alert._id}</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-700">{alert.description || alert.message}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Severidad</h4>
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${alert.severity === 'critical' ? 'bg-red-100 text-red-800' : alert.severity === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  <span className="capitalize">{alert.severity}</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Estado</h4>
                <div className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                  <span className="capitalize">{alert.status}</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Tipo</h4>
                <p className="text-sm text-gray-700 capitalize">{alert.type}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Fuente</h4>
                <p className="text-sm text-gray-700">{alert.source}</p>
              </div>
              
              {alert.geolocation && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Ubicación</h4>
                  <p className="text-sm text-gray-700">{alert.geolocation.country} - {alert.geolocation.region}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Timestamp</h4>
                <p className="text-sm text-gray-700">
                  {(() => {
                    const date = new Date(alert.createdAt || alert.timestamp || (alert as any).detection_time);
                    return !isNaN(date.getTime()) ? date.toLocaleString('es-ES') : 'Fecha no disponible';
                  })()}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  onUpdate(alert._id, { status: 'investigating' });
                  onClose();
                }}
                className="btn-primary flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Investigar</span>
              </button>
              
              <button
                onClick={() => {
                  onUpdate(alert._id, { status: 'resolved' });
                  onClose();
                }}
                className="btn-secondary flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Resolver</span>
              </button>
              
              <button
                onClick={() => {
                  onUpdate(alert._id, { status: 'closed' });
                  onClose();
                }}
                className="btn-secondary flex items-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Cerrar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;

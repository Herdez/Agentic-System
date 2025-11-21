import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { agentService, alertService } from '../services/api';
import { Agent, SystemStats, Alert } from '../types';
import { Shield, Activity, AlertTriangle, TrendingUp, Users, Eye, RefreshCw } from 'lucide-react';
import SimulationControl from '../components/SimulationControl';

const Dashboard: React.FC = () => {
  const { state: authState } = useAuth();
  const { alerts: socketAlerts, agents: socketAgents, isConnected } = useSocket();
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [polledAgents, setPolledAgents] = useState<Agent[]>([]);
  const [polledAlerts, setPolledAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Detectar si estamos en Netlify (sin WebSockets)
  const isNetlify = !isConnected && window.location.hostname.includes('netlify');
  
  // Usar datos del WebSocket si está conectado, sino usar datos de polling
  const agents = isConnected ? socketAgents : polledAgents;
  const alerts = isConnected ? socketAlerts : polledAlerts;

  // Debug para entender el problema de sincronización
  console.log('📊 Dashboard RENDER - Estado de datos:', {
    isConnected,
    isNetlify,
    socketAgents: socketAgents?.length || 0,
    socketAlerts: socketAlerts?.length || 0,
    polledAgents: polledAgents?.length || 0, 
    polledAlerts: polledAlerts?.length || 0,
    finalAgents: agents?.length || 0,
    finalAlerts: alerts?.length || 0,
    agentsPassedToSimulation: agents,
    alertsPassedToSimulation: alerts
  });

  const loadDashboardData = async () => {
    try {
      const promises: Promise<any>[] = [agentService.getSystemStats()];
      
      // Si no hay WebSocket (Netlify), cargar también agentes y alertas
      if (isNetlify) {
        promises.push(
          agentService.getAllAgents(),
          alertService.getRecentAlerts(50)
        );
      }
      
      const responses = await Promise.all(promises);
      const [statsResponse, agentsResponse, alertsResponse] = responses;

      if (statsResponse.success || statsResponse.data || statsResponse) {
        const statsData = statsResponse.success ? statsResponse.data : (statsResponse.data || statsResponse);
        setSystemStats(statsData);
      }
      
      if (isNetlify && agentsResponse) {
        console.log('🤖 Dashboard: Respuesta de agentes:', agentsResponse);
        const agentsData = agentsResponse.success ? agentsResponse.data : (agentsResponse.data || agentsResponse);
        if (agentsData) {
          console.log('🤖 Dashboard: Agentes cargados:', agentsData.length);
          // Debug de TODOS los agentes (no solo 3)
          agentsData.forEach((agent: any, index: number) => {
            console.log(`🔍 Agente ${index + 1}:`, {
              _id: agent._id,
              id: agent.id,
              name: agent.name,
              type: agent.type,
              status: agent.status,
              fullAgent: agent
            });
          });
          
          // Resumen de todos los agentes para búsqueda
          console.log('📋 RESUMEN: IDs disponibles:', agentsData.map((a: any) => a._id || a.id));
          setPolledAgents(agentsData);
        } else {
          console.log('❌ Dashboard: No hay datos de agentes en la respuesta');
        }
      } else {
        console.log('❌ Dashboard: No se cargaron agentes - isNetlify:', isNetlify, 'agentsResponse:', !!agentsResponse);
      }
      
      if (isNetlify && alertsResponse) {
        const alertsData = alertsResponse.success ? alertsResponse.data : (alertsResponse.data || alertsResponse);
        if (alertsData) {
          console.log('🚨 Dashboard: Alertas cargadas:', alertsData.length);
          // Debug de las primeras alertas
          alertsData.slice(0, 3).forEach((alert: any, index: number) => {
            console.log(`🔍 Alerta ${index + 1}:`, {
              name: alert.name,
              title: alert.title,
              message: alert.message,
              agentId: alert.agentId,
              agent_id: alert.agent_id,
              source: alert.source,
              source_ip: alert.source_ip,
              fullAlert: alert
            });
          });
          setPolledAlerts(alertsData);
        }
      }
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // En Netlify, actualizar cada 5 segundos para máximo dinamismo
    const interval = setInterval(loadDashboardData, isNetlify ? 5000 : 30000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNetlify]);

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-red-600 bg-red-100';
      case 'HIGH':
        return 'text-orange-600 bg-orange-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'LOW':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical').length;
  const activeAgents = agents.filter(agent => agent.status === 'active').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
          <span className="text-lg text-gray-600">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Seguridad</h1>
          <p className="text-gray-600 mt-1">
            Bienvenido, {authState.user?.username}. Sistema de defensa blockchain activo.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-full ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium">
              {isConnected ? 'Sistema Activo' : 'Sistema Desconectado'}
            </span>
          </div>
          
          <span className="text-sm text-gray-500">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Agentes Activos</p>
              <p className="text-3xl font-bold text-green-600">{activeAgents}</p>
              <p className="text-xs text-gray-500">de {agents.length} totales</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alertas Críticas</p>
              <p className="text-3xl font-bold text-red-600">{criticalAlerts}</p>
              <p className="text-xs text-gray-500">últimas 24h</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nodos de Red</p>
              <p className="text-3xl font-bold text-blue-600">
                {systemStats?.network?.nodesActive || 47}
              </p>
              <p className="text-xs text-gray-500">activos en red</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nivel de Amenaza</p>
              <p className={`text-3xl font-bold ${getThreatLevelColor(systemStats?.network?.threatLevel || 'LOW').split(' ')[0]}`}>
                {systemStats?.network?.threatLevel || 'LOW'}
              </p>
              <p className="text-xs text-gray-500">estado actual</p>
            </div>
            <div className={`p-3 rounded-full ${getThreatLevelColor(systemStats?.network?.threatLevel || 'LOW').split(' ')[1]}`}>
              <Eye className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Control - Pasando datos sincronizados */}
      <div className="mb-8">
        <SimulationControl 
          sharedAgents={agents} 
          sharedAlerts={alerts}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agentes Status */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Estado de Agentes AI</h3>
              <button
                onClick={loadDashboardData}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Actualizar"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.slice(0, 6).map((agent) => (
                <AgentCard key={agent._id} agent={agent} />
              ))}
            </div>
          </div>
        </div>

        {/* Alertas Recientes */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Alertas Recientes</h3>
              <span className="text-sm text-gray-500">{alerts.length} alertas</span>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.slice(0, 8).map((alert, index) => (
                <AlertItem key={alert._id || index} alert={alert} agents={agents} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Network Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Actividad de Red</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Transacciones/segundo</span>
              <span className="text-lg font-semibold text-green-600">
                {systemStats?.network?.transactionsPerSecond?.toLocaleString() || '1,247'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Latencia de red</span>
              <span className="text-lg font-semibold text-blue-600">
                {systemStats?.network?.networkLatency || '0.3'}s
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Uptime del sistema</span>
              <span className="text-lg font-semibold text-green-600">
                {systemStats?.network?.uptime || '99.97'}%
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Métricas de Seguridad</h3>
            <Users className="h-5 w-5 text-primary-500" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Detección de amenazas</span>
              <span className="text-lg font-semibold text-green-600">
                {(systemStats as any)?.security_metrics?.threat_detection_rate || 
                 systemStats?.threats?.prevention_rate || '94'}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Falsos positivos</span>
              <span className="text-lg font-semibold text-blue-600">
                {(systemStats as any)?.security_metrics?.false_positive_rate || '2.1'}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Eficiencia de respuesta</span>
              <span className="text-lg font-semibold text-green-600">
                {(systemStats as any)?.security_metrics?.response_efficiency || '96'}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Resiliencia del sistema</span>
              <span className="text-lg font-semibold text-green-600">
                {(systemStats as any)?.security_metrics?.system_resilience || '98'}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tiempo de resolución</span>
              <span className="text-lg font-semibold text-orange-600">
                {(systemStats as any)?.security_metrics?.incident_resolution_time || '45'} min
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Nivel de protección</span>
              <span className="text-lg font-semibold text-green-600">
                {(systemStats as any)?.security_metrics?.data_protection_index || '97'}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar información de un agente
const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-600';
      case 'investigando':
        return 'bg-blue-100 text-blue-800';
      case 'respondiendo':
        return 'bg-orange-100 text-orange-800';
      case 'escaneando':
        return 'bg-purple-100 text-purple-800';
      case 'monitoreo':
        return 'bg-indigo-100 text-indigo-800';
      case 'mantenimiento':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      // Estados legacy por compatibilidad
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'scanning':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAgentIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'intrusion_detection': '🔍',
      'incident_response': '⚡',
      'vulnerability_analysis': '🔍',
      'threat_intelligence': '🕵️',
      'defense_coordination': '🎯',
      'audit_compliance': '📋',
      'recovery_resilience': '🔧'
    };
    return icons[type] || '🤖';
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getAgentIcon(agent.type)}</span>
          <div>
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {agent.name}
            </h4>
            <p className="text-xs text-gray-500">{agent.type.replace('_', ' ')}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(agent.status)}`}>
          {agent.status}
        </span>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Amenazas:</span>
          <span className="font-medium">{agent.metrics?.threatsDetected || 0}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Uptime:</span>
          <span className="font-medium">{agent.metrics?.uptime || 100}%</span>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar una alerta
const AlertItem: React.FC<{ alert: Alert; agents: Agent[] }> = ({ alert, agents }) => {
  // Debug logging para verificar datos
  console.log('🔍 AlertItem renderizando:', {
    alertName: alert.name,
    alertTitle: alert.title,
    alertMessage: alert.message,
    agentId: alert.agentId,
    agent_id: (alert as any).agent_id,
    availableAgents: agents.length
  });
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    });
  };

  // Obtener el nombre específico de la amenaza usando los datos correctos
  const threatName = alert.name || alert.message || alert.title || alert.threat_type || 'Security Alert';
  
  // Buscar el nombre del agente usando agentId (tipo definido) o agent_id (Netlify)
  const agentInfo = agents.find(agent => 
    agent._id === alert.agentId || 
    agent._id === (alert as any).agent_id ||
    agent.type === (alert as any).agent_id
  );
  
  // Debug de la búsqueda del agente
  if (!agentInfo && agents.length > 0) {
    console.log(`❌ No se encontró agente para:`, {
      alertAgentId: (alert as any).agent_id,
      alertAgentIdType: alert.agentId,
      availableAgentIds: agents.map(a => ({ _id: a._id, type: a.type, name: a.name }))
    });
  }
  
  const agentName = agentInfo?.name || alert.agentType?.replace('_', ' ').toUpperCase() || 'SISTEMA';
  const sourceIP = alert.source_ip || alert.details?.sourceIP || alert.source || 'Unknown';

  return (
    <div className={`p-3 rounded-lg border ${getSeverityColor(alert.severity || 'low')}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900">{threatName}</p>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {agentName} • {sourceIP} • {formatTime(alert.timestamp || alert.createdAt || new Date())}
          </p>
          {alert.details?.description && (
            <p className="text-xs text-gray-500 mt-1">{alert.details.description}</p>
          )}
        </div>
        <div className="text-right ml-2">
          <span className="text-xs font-medium block">
            {alert.severity?.toUpperCase() || 'INFO'}
          </span>
          {(alert as any).confidence && (
            <span className="text-xs text-gray-500 block mt-1">
              {(alert as any).confidence}% conf.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

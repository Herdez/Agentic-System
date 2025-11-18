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

  useEffect(() => {
    loadDashboardData();
    // En Netlify, actualizar más frecuentemente para simular tiempo real
    const interval = setInterval(loadDashboardData, isNetlify ? 10000 : 30000);
    
    return () => clearInterval(interval);
  }, [isNetlify]);

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
        const agentsData = agentsResponse.success ? agentsResponse.data : (agentsResponse.data || agentsResponse);
        if (agentsData) {
          setPolledAgents(agentsData);
        }
      }
      
      if (isNetlify && alertsResponse) {
        const alertsData = alertsResponse.success ? alertsResponse.data : (alertsResponse.data || alertsResponse);
        if (alertsData) {
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

      {/* Simulation Control */}
      <div className="mb-8">
        <SimulationControl />
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
                <AlertItem key={alert._id || index} alert={alert} />
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
              <span className="text-sm text-gray-600">Amenazas detectadas (24h)</span>
              <span className="text-lg font-semibold text-orange-600">
                {agents.reduce((sum, agent) => sum + (agent.metrics?.threatsDetected || 0), 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Respuesta promedio</span>
              <span className="text-lg font-semibold text-green-600">
                {(agents.reduce((sum, agent) => sum + (agent.metrics?.responseTime || 0), 0) / agents.length || 0.3).toFixed(1)}s
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Precisión del sistema</span>
              <span className="text-lg font-semibold text-green-600">
                {(agents.reduce((sum, agent) => sum + (agent.metrics?.accuracy || 95), 0) / agents.length || 95).toFixed(1)}%
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
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'scanning':
        return 'bg-blue-100 text-blue-800';
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
const AlertItem: React.FC<{ alert: Alert }> = ({ alert }) => {
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
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`p-3 rounded-lg border ${getSeverityColor(alert.severity || 'low')}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium">{alert.message}</p>
          <p className="text-xs opacity-75 mt-1">
            {alert.agentType && `${alert.agentType} - `}
            {formatTime(alert.createdAt || new Date())}
          </p>
        </div>
        <span className="text-xs font-medium ml-2">
          {alert.severity?.toUpperCase() || 'INFO'}
        </span>
      </div>
    </div>
  );
};

export default Dashboard;

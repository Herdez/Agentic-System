import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { agentService } from '../services/api';
import { Agent } from '../types';
import { Shield, Play, Pause, Settings, Activity, AlertCircle, CheckCircle, RefreshCw, Zap } from 'lucide-react';

const Agents: React.FC = () => {
  const { agents: socketAgents, emitAgentAction } = useSocket();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    if (socketAgents.length > 0) {
      setAgents(socketAgents);
    }
  }, [socketAgents]);

  const loadAgents = async () => {
    try {
      const response = await agentService.getAllAgents();
      if (response.success) {
        setAgents(response.data);
      }
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentAction = async (agentId: string, action: string) => {
    try {
      setActionLoading(agentId);
      
      // Use socket context which handles both WebSocket and HTTP for Netlify
      await emitAgentAction(agentId, action);
      
      // Reload agents to get updated data
      setTimeout(loadAgents, 1000);
    } catch (error) {
      console.error('Error executing agent action:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'inactive':
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      case 'maintenance':
        return <Settings className="w-5 h-5 text-yellow-600" />;
      case 'scanning':
        return <Activity className="w-5 h-5 text-blue-600 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'scanning':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAgentIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'intrusion_detection': '🔍',
      'incident_response': '⚡',
      'vulnerability_analysis': '🛡️',
      'threat_intelligence': '🕵️',
      'defense_coordination': '🎯',
      'audit_compliance': '📋',
      'recovery_resilience': '🔧'
    };
    return icons[type] || '🤖';
  };

  const getAgentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'intrusion_detection': 'Detección de Intrusos',
      'incident_response': 'Respuesta a Incidentes',
      'vulnerability_analysis': 'Análisis de Vulnerabilidades',
      'threat_intelligence': 'Inteligencia de Amenazas',
      'defense_coordination': 'Coordinación de Defensa',
      'audit_compliance': 'Auditoría y Cumplimiento',
      'recovery_resilience': 'Recuperación y Resiliencia'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
          <span className="text-lg text-gray-600">Cargando agentes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agentes AI</h1>
          <p className="text-gray-600 mt-1">
            Gestiona y monitorea los {agents.length} agentes AI del sistema de defensa
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium text-green-600">
              {agents.filter(a => a.status === 'active').length}
            </span> activos
          </div>
          <button
            onClick={loadAgents}
            className="btn-primary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <AgentCard 
            key={agent._id} 
            agent={agent} 
            onAction={handleAgentAction}
            isLoading={actionLoading === agent._id}
          />
        ))}
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Rendimiento Promedio</h3>
            <Activity className="w-5 h-5 text-primary-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tiempo de respuesta:</span>
              <span className="font-medium">
                {(agents.reduce((sum, a) => sum + (a.metrics?.responseTime || 0), 0) / agents.length).toFixed(2)}s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Precisión:</span>
              <span className="font-medium">
                {(agents.reduce((sum, a) => sum + (a.metrics?.accuracy || 0), 0) / agents.length).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Uptime:</span>
              <span className="font-medium">
                {(agents.reduce((sum, a) => sum + (a.metrics?.uptime || 0), 0) / agents.length).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Amenazas Detectadas</h3>
            <Shield className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {agents.reduce((sum, a) => sum + (a.metrics?.threatsDetected || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total acumulado</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Acciones Ejecutadas</h3>
            <Zap className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {agents.reduce((sum, a) => sum + (a.metrics?.actionsExecuted || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total acumulado</div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AgentCardProps {
  agent: Agent;
  onAction: (agentId: string, action: string) => void;
  isLoading: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onAction, isLoading }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'inactive':
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      case 'maintenance':
        return <Settings className="w-5 h-5 text-yellow-600" />;
      case 'scanning':
        return <Activity className="w-5 h-5 text-blue-600 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'scanning':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAgentIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'intrusion_detection': '🔍',
      'incident_response': '⚡',
      'vulnerability_analysis': '🛡️',
      'threat_intelligence': '🕵️',
      'defense_coordination': '🎯',
      'audit_compliance': '📋',
      'recovery_resilience': '🔧'
    };
    return icons[type] || '🤖';
  };

  const getAgentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'intrusion_detection': 'Detección de Intrusos',
      'incident_response': 'Respuesta a Incidentes',
      'vulnerability_analysis': 'Análisis de Vulnerabilidades',
      'threat_intelligence': 'Inteligencia de Amenazas',
      'defense_coordination': 'Coordinación de Defensa',
      'audit_compliance': 'Auditoría y Cumplimiento',
      'recovery_resilience': 'Recuperación y Resiliencia'
    };
    return labels[type] || type;
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getAgentIcon(agent.type)}</div>
          <div>
            <h3 className="font-semibold text-gray-900">{agent.name}</h3>
            <p className="text-sm text-gray-600">{getAgentTypeLabel(agent.type)}</p>
          </div>
        </div>
        
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(agent.status)}`}>
          {getStatusIcon(agent.status)}
          <span className="text-xs font-medium">{agent.status.toUpperCase()}</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-red-600">
            {agent.metrics?.threatsDetected || 0}
          </div>
          <div className="text-xs text-gray-600">Amenazas</div>
        </div>
        
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-green-600">
            {agent.metrics?.uptime || 100}%
          </div>
          <div className="text-xs text-gray-600">Uptime</div>
        </div>
        
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-blue-600">
            {agent.metrics?.responseTime || 0.3}s
          </div>
          <div className="text-xs text-gray-600">Respuesta</div>
        </div>
        
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-purple-600">
            {agent.metrics?.accuracy || 95}%
          </div>
          <div className="text-xs text-gray-600">Precisión</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {agent.description}
      </p>

      {/* Actions */}
      <div className="flex space-x-2">
        {agent.status === 'active' ? (
          <>
            <button
              onClick={() => onAction(agent._id, 'scan')}
              disabled={isLoading}
              className="flex-1 btn-primary text-xs py-2 flex items-center justify-center space-x-1"
            >
              {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
              <span>Escanear</span>
            </button>
            <button
              onClick={() => onAction(agent._id, 'deactivate')}
              disabled={isLoading}
              className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center space-x-1"
            >
              <Pause className="w-3 h-3" />
              <span>Pausar</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => onAction(agent._id, 'activate')}
            disabled={isLoading}
            className="flex-1 btn-primary text-xs py-2 flex items-center justify-center space-x-1"
          >
            {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            <span>Activar</span>
          </button>
        )}
      </div>

      {/* Last Activity */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Última actividad:</span>
          <span>
            {new Date(agent.lastActivity).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Agents;

import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useToast } from '../contexts/ToastContext';
import { simulationService } from '../services/api';

interface SimulationStats {
  isRunning: boolean;
  totalAgents: number;
  activeAgents: number;
  recentAlerts: number;
  criticalAlerts: number;
  lastUpdate: string;
}

const SimulationControl = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<SimulationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { socket, agents, alerts } = useSocket();
  const { addToast } = useToast();

  // Calcular estadísticas en tiempo real desde los datos del socket
  const calculateRealTimeStats = useCallback(() => {
    if (agents && alerts) {
      // Filtrar agentes activos (todos excepto inactivos)
      const activeAgents = agents.filter(agent => agent.status !== 'inactive').length;
      
      // Filtrar solo alertas activas (no resueltas) de la última hora
      const activeAlerts = alerts.filter(alert => alert.status !== 'resolved');
      const recentAlerts = activeAlerts.filter(alert => {
        const alertTime = new Date(alert.createdAt || alert.timestamp || new Date());
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return alertTime > hourAgo;
      }).length;
      
      // Solo alertas críticas activas (no resueltas)
      const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical').length;

      const stats = {
        isRunning,
        totalAgents: agents.length,
        activeAgents,
        recentAlerts,
        criticalAlerts,
        lastUpdate: new Date().toISOString()
      };
      
      // Log para debugging
      console.log('🔧 Estadísticas calculadas:', {
        totalAlertas: alerts.length,
        alertasActivas: activeAlerts.length,
        alertasRecientes: recentAlerts,
        alertasCriticas: criticalAlerts,
        agentesActivos: activeAgents
      });

      return stats;
    }
    return null;
  }, [agents, alerts, isRunning]);

  // Función para obtener el estado de la simulación - ANTES del useEffect
  const fetchSimulationStatus = useCallback(async () => {
    try {
      console.log('🔧 Obteniendo estado de simulación...');
      const response = await simulationService.getStatus();
      console.log('🔧 Respuesta API status:', response);
      
      // Manejar tanto respuesta con .success como respuesta directa
      const data = response?.success ? response.data : (response?.data || response);
      if (data) {
        console.log('🔧 Datos extraídos:', data);
        
        setStats(data);
        
        // Solo actualizar isRunning si realmente ha cambiado
        const newIsRunning = data?.isRunning || false;
        setIsRunning(prev => {
          if (newIsRunning !== prev) {
            console.log('🔧 CAMBIANDO estado isRunning:', prev, '->', newIsRunning);
            return newIsRunning;
          } else {
            console.log('🔧 Estado isRunning sin cambios:', prev);
            return prev;
          }
        });
      }
    } catch (error) {
      console.error('❌ Error obteniendo estado de simulación:', error);
    }
  }, []); // Sin dependencias para evitar re-renders

  useEffect(() => {
    console.log('🔧 SimulationControl: Inicializando componente');
    
    // Obtener estado inicial
    fetchSimulationStatus();

    if (socket) {
      console.log('🔧 SimulationControl: Configurando WebSocket listeners');
      
      // Listener para estado de simulación
      const handleSimulationStatus = (data: { running: boolean }) => {
        console.log('🔧 WebSocket simulation-status recibido:', data);
        setIsRunning(data.running);
      };

      const handleSimulationUpdate = (data: SimulationStats) => {
        console.log('🔧 WebSocket simulation_update recibido:', data);
        setStats(data);
        // NO actualizar isRunning aquí para evitar conflictos
      };

      socket.on('simulation-status', handleSimulationStatus);
      socket.on('simulation_update', handleSimulationUpdate);

      // Cleanup listeners
      return () => {
        console.log('🔧 SimulationControl: Limpiando WebSocket listeners');
        socket.off('simulation-status', handleSimulationStatus);
        socket.off('simulation_update', handleSimulationUpdate);
      };
    } else {
      console.log('🔧 SimulationControl: Sin WebSocket, configurando polling inteligente');
      
      // Polling inteligente: más frecuente si está corriendo, menos si está pausado
      const setupPolling = () => {
        const currentInterval = isRunning ? 15000 : 60000; // 15s si está corriendo, 60s si está pausado
        console.log(`🔧 Configurando polling cada ${currentInterval/1000}s (isRunning: ${isRunning})`);
        
        return setInterval(() => {
          if (isRunning || Date.now() % 60000 < 5000) { // Cada minuto si está pausado
            fetchSimulationStatus();
          }
        }, currentInterval);
      };

      const interval = setupPolling();
      
      // Reconfigurar polling cuando cambie el estado
      const reconfigInterval = setInterval(() => {
        clearInterval(interval);
        setupPolling();
      }, 30000);
      
      return () => {
        clearInterval(interval);
        clearInterval(reconfigInterval);
      };
    }
  }, [socket, fetchSimulationStatus]); // Incluir fetchSimulationStatus como dependencia

  // Actualizar estadísticas cuando cambien los agentes o alertas
  useEffect(() => {
    const realTimeStats = calculateRealTimeStats();
    if (realTimeStats) {
      setStats(realTimeStats);
    }
  }, [calculateRealTimeStats]);

  const handleStartSimulation = async () => {
    if (isLoading || isRunning) {
      console.log('🔧 Ignorando start - isLoading:', isLoading, 'isRunning:', isRunning);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('🔧 Iniciando simulación...');
      const response = await simulationService.start();
      console.log('🔧 Respuesta start:', response);
      
      if (response.success) {
        addToast({
          type: 'success',
          title: 'Simulación iniciada',
          message: 'La simulación de agentes ha comenzado exitosamente'
        });
        setIsRunning(true);
        console.log('🔧 Estado local actualizado a: RUNNING');
        
        // Eliminamos setTimeout para reducir re-renders
      }
    } catch (error) {
      console.error('❌ Error iniciando simulación:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo iniciar la simulación'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopSimulation = async () => {
    if (isLoading || !isRunning) {
      console.log('🔧 Ignorando stop - isLoading:', isLoading, 'isRunning:', isRunning);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('🔧 Deteniendo simulación...');
      const response = await simulationService.stop();
      console.log('🔧 Respuesta stop:', response);
      
      if (response.success) {
        addToast({
          type: 'info',
          title: 'Simulación detenida',
          message: 'La simulación de agentes ha sido pausada'
        });
        setIsRunning(false);
        console.log('🔧 Estado local actualizado a: STOPPED');
        
        // Eliminamos setTimeout para reducir re-renders
      }
    } catch (error) {
      console.error('❌ Error deteniendo simulación:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo detener la simulación'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestartSimulation = async () => {
    try {
      await simulationService.restart();
      addToast({
        type: 'success',
        title: 'Simulación reiniciada',
        message: 'La simulación ha sido reiniciada correctamente'
      });
      setIsRunning(true);
      // Eliminamos setTimeout para reducir re-renders
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo reiniciar la simulación'
      });
    }
  };

  return (
    <div className="simulation-control-card">
      <div className="card-header">
        <h3 className="card-title">🎮 Control de Simulación</h3>
        <div className={`status-badge ${isRunning ? 'status-active' : 'status-inactive'}`}>
          {isRunning ? 'ACTIVA' : 'INACTIVA'}
        </div>
      </div>
      
      <div className="card-body">
        {stats && (
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Agentes Totales:</span>
              <span className="stat-value">{stats.totalAgents}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Agentes Activos:</span>
              <span className="stat-value">{stats.activeAgents}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Alertas Recientes:</span>
              <span className="stat-value">{stats.recentAlerts}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Alertas Críticas:</span>
              <span className="stat-value critical">{stats.criticalAlerts}</span>
            </div>
          </div>
        )}

        <div className="control-buttons">
          {!isRunning ? (
            <button 
              className="btn btn-primary"
              onClick={handleStartSimulation}
            >
              ▶️ Iniciar Simulación
            </button>
          ) : (
            <button 
              className="btn btn-secondary"
              onClick={handleStopSimulation}
            >
              ⏸️ Pausar Simulación
            </button>
          )}
          
          <button 
            className="btn btn-info"
            onClick={handleRestartSimulation}
          >
            🔄 Reiniciar
          </button>
        </div>

        <div className="simulation-info">
          <h4>Estado de la Simulación:</h4>
          <ul>
            <li>✅ Detección de intrusiones automática</li>
            <li>✅ Respuesta a incidentes activa</li>
            <li>✅ Análisis de vulnerabilidades continuo</li>
            <li>✅ Inteligencia de amenazas actualizada</li>
            <li>✅ Coordinación defensiva operativa</li>
            <li>✅ Auditoría de cumplimiento en línea</li>
            <li>✅ Sistemas de recuperación listos</li>
          </ul>
        </div>

        {stats && stats.lastUpdate && (
          <div className="last-update">
            Última actualización: {new Date(stats.lastUpdate).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationControl;

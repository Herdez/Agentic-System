import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useToast } from '../contexts/ToastContext';

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
  const { socket } = useSocket();
  const { addToast } = useToast();

  useEffect(() => {
    if (socket) {
      // Escuchar actualizaciones de la simulación
      socket.on('simulation-status', (data: { running: boolean }) => {
        setIsRunning(data.running);
      });

      socket.on('simulation_update', (data: SimulationStats) => {
        setStats(data);
      });

      // Obtener estado inicial
      fetchSimulationStatus();

      return () => {
        socket.off('simulation-status');
        socket.off('simulation_update');
      };
    }
  }, [socket]);

  const fetchSimulationStatus = async () => {
    try {
      const response = await fetch('/api/simulation/status');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
        setIsRunning(data.data?.isRunning || false);
      }
    } catch (error) {
      console.error('Error obteniendo estado de simulación:', error);
    }
  };

  const handleStartSimulation = () => {
    if (socket) {
      socket.emit('start-simulation');
      addToast({
        type: 'success',
        title: 'Simulación iniciada',
        message: 'La simulación de agentes ha comenzado exitosamente'
      });
    }
  };

  const handleStopSimulation = () => {
    if (socket) {
      socket.emit('stop-simulation');
      addToast({
        type: 'info',
        title: 'Simulación detenida',
        message: 'La simulación de agentes ha sido pausada'
      });
    }
  };

  const handleRestartSimulation = async () => {
    try {
      const response = await fetch('/api/simulation/restart', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        addToast({
          type: 'success',
          title: 'Simulación reiniciada',
          message: 'La simulación ha sido reiniciada correctamente'
        });
        setTimeout(() => {
          setIsRunning(true);
        }, 1000);
      }
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

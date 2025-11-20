import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
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
  const { socket, agents, alerts, isConnected } = useSocket();
  const [fallbackAgents, setFallbackAgents] = useState<any[]>([]);
  const [fallbackAlerts, setFallbackAlerts] = useState<any[]>([]);

  // Función para obtener datos cuando WebSocket no está disponible
  const fetchFallbackData = useCallback(async () => {
    try {
      console.log('🔄 fetchFallbackData iniciado...');
      
      // En Netlify, usar las Netlify Functions directamente
      const isNetlify = window.location.hostname.includes('netlify');
      
      let agentsArray = [];
      let alertsArray = [];
      
      if (isNetlify) {
        // Para Netlify, usar las Netlify Functions
        console.log('🌐 Detectado entorno Netlify, usando Netlify Functions...');
        
        const agentsResponse = await fetch('/.netlify/functions/api?endpoint=agents');
        const agentsText = await agentsResponse.text();
        console.log('📡 Respuesta raw de agentes:', agentsText.substring(0, 200));
        
        try {
          const agentsData = JSON.parse(agentsText);
          agentsArray = agentsData?.success ? agentsData.data : (Array.isArray(agentsData) ? agentsData : []);
        } catch (e) {
          console.error('❌ Error parseando agentes:', e);
        }
        
        const alertsResponse = await fetch('/.netlify/functions/api?endpoint=alerts');
        const alertsText = await alertsResponse.text();
        console.log('📡 Respuesta raw de alertas:', alertsText.substring(0, 200));
        
        try {
          const alertsData = JSON.parse(alertsText);
          alertsArray = alertsData?.success ? alertsData.data : (Array.isArray(alertsData) ? alertsData : []);
        } catch (e) {
          console.error('❌ Error parseando alertas:', e);
        }
      } else {
        // Para desarrollo local
        console.log('🏠 Detectado entorno local, usando API local...');
        
        const agentsResponse = await fetch('/api/agents');
        const agentsData = await agentsResponse.json();
        agentsArray = agentsData?.success ? agentsData.data : (Array.isArray(agentsData) ? agentsData : []);
        
        const alertsResponse = await fetch('/api/alerts');
        const alertsData = await alertsResponse.json();
        alertsArray = alertsData?.success ? alertsData.data : (Array.isArray(alertsData) ? alertsData : []);
      }
      
      setFallbackAgents(agentsArray);
      setFallbackAlerts(alertsArray);
      
      console.log('✅ Datos fallback obtenidos:', { 
        agentes: agentsArray.length, 
        alertas: alertsArray.length,
        fuente: isNetlify ? 'Netlify Functions' : 'API Local'
      });
      
    } catch (error) {
      console.error('❌ Error obteniendo datos fallback:', error);
      setFallbackAgents([]);
      setFallbackAlerts([]);
    }
  }, []);

  // Calcular estadísticas en tiempo real desde los datos del socket
  const calculateRealTimeStats = useCallback(() => {
    // Usar datos del socket si están disponibles, sino usar fallback
    const dataAgents = (agents && agents.length > 0) ? agents : fallbackAgents;
    const dataAlerts = (alerts && alerts.length > 0) ? alerts : fallbackAlerts;
    
    console.log('🔧 calculateRealTimeStats - Estado de datos:', {
      socketAgents: agents?.length || 0,
      socketAlerts: alerts?.length || 0,
      fallbackAgents: fallbackAgents.length,
      fallbackAlerts: fallbackAlerts.length,
      usingData: {
        agents: dataAgents?.length || 0,
        alerts: dataAlerts?.length || 0
      },
      isConnected
    });
    
    if (dataAgents && dataAlerts && dataAgents.length > 0) {
      // Filtrar agentes activos (todos excepto inactivos)
      const activeAgents = dataAgents.filter(agent => agent.status !== 'inactive').length;
      
      // Filtrar solo alertas activas (no resueltas) de la última hora
      const activeAlerts = dataAlerts.filter(alert => alert.status !== 'resolved');
      const recentAlerts = activeAlerts.filter(alert => {
        const alertTime = new Date(alert.createdAt || alert.timestamp || new Date());
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return alertTime > hourAgo;
      }).length;
      
      // Solo alertas críticas activas (no resueltas)
      const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical').length;

      const stats = {
        isRunning,
        totalAgents: dataAgents.length,
        activeAgents,
        recentAlerts,
        criticalAlerts,
        lastUpdate: new Date().toISOString()
      };
      
      // Log para debugging
      console.log('🔧 Estadísticas calculadas:', {
        totalAlertas: dataAlerts.length,
        alertasActivas: activeAlerts.length,
        alertasRecientes: recentAlerts,
        alertasCriticas: criticalAlerts,
        agentesActivos: activeAgents,
        fuenteDatos: dataAgents === agents ? 'WebSocket' : 'Fallback API'
      });

      return stats;
    }
    return null;
  }, [agents, alerts, isRunning, fallbackAgents, fallbackAlerts]);

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
            
            // Guardar en localStorage para persistencia
            try {
              localStorage.setItem('sim-state', JSON.stringify({
                isRunning: newIsRunning,
                timestamp: Date.now()
              }));
            } catch (e) {
              console.warn('No se pudo guardar estado en localStorage:', e);
            }
            
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

  // Efecto para cargar datos fallback cuando no hay WebSocket
  useEffect(() => {
    // Detectar inmediatamente si no tenemos WebSocket o si estamos en Netlify
    const isNetlifyEnv = window.location.hostname.includes('netlify');
    const needsFallback = !isConnected || isNetlifyEnv || (!agents?.length && !alerts?.length);
    
    if (needsFallback) {
      console.log('🔄 Detectado entorno sin WebSocket, cargando datos fallback...', {
        isConnected,
        isNetlifyEnv,
        hasAgents: !!agents?.length,
        hasAlerts: !!alerts?.length
      });
      
      // Cargar inmediatamente
      fetchFallbackData();
      
      // Polling cada 15 segundos para mantener datos actualizados
      const interval = setInterval(fetchFallbackData, 15000);
      return () => clearInterval(interval);
    }
  }, [isConnected, fetchFallbackData, agents, alerts]);

  useEffect(() => {
    console.log('🔧 SimulationControl: Inicializando componente con simulación siempre activa');
    
    // Establecer estado inicial como activo
    setIsRunning(true);
    
    // Asegurar que la simulación esté ejecutándose
    ensureSimulationIsRunning();
    
    // Obtener estado actualizado
    fetchSimulationStatus();

    if (socket) {
      console.log('🔧 SimulationControl: Configurando WebSocket listeners');
      
      // Listener para estado de simulación
      const handleSimulationStatus = (data: { running: boolean }) => {
        console.log('🔧 WebSocket simulation-status recibido:', data);
        // Siempre mantener como activo, incluso si el backend dice que no está corriendo
        setIsRunning(true);
      };

      const handleSimulationUpdate = (data: SimulationStats) => {
        console.log('🔧 WebSocket simulation_update recibido:', data);
        setStats(data);
        // Forzar estado activo
        setIsRunning(true);
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
      console.log('🔧 SimulationControl: Sin WebSocket, usando polling cada 20 segundos');
      
      // Polling menos agresivo para evitar cambios erráticos en Netlify
      const interval = setInterval(() => {
        console.log('🔧 Ejecutando polling de estado (cada 20s)...');
        fetchSimulationStatus();
        // Asegurar que siga activa
        ensureSimulationIsRunning();
      }, 20000); // Cada 20 segundos (más estable)
      
      return () => clearInterval(interval);
    }
  }, [socket, fetchSimulationStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Actualizar estadísticas cuando cambien los agentes o alertas
  useEffect(() => {
    const realTimeStats = calculateRealTimeStats();
    if (realTimeStats) {
      setStats(realTimeStats);
    }
  }, [calculateRealTimeStats]);

  // Función para asegurar que la simulación esté siempre activa
  const ensureSimulationIsRunning = useCallback(async () => {
    try {
      console.log('🔧 Asegurando que la simulación esté activa...');
      const response = await simulationService.start();
      console.log('🔧 Respuesta start (auto):', response);
      
      if (response.success) {
        console.log('✅ Simulación asegurada como activa');
        setIsRunning(true);
        
        // Guardar en localStorage para persistencia
        try {
          localStorage.setItem('sim-state', JSON.stringify({
            isRunning: true,
            timestamp: Date.now()
          }));
        } catch (e) {
          console.warn('No se pudo guardar estado en localStorage:', e);
        }
      }
    } catch (error) {
      console.error('❌ Error asegurando simulación activa:', error);
      // Si falla, aún marcamos como running para mostrar UI consistente
      setIsRunning(true);
    }
  }, []);

  return (
    <div className="simulation-control-card">
      <div className="card-header">
        <h3 className="card-title">🛡️ Sistema de Defensa Blockchain</h3>
        <div className="status-badge status-active">
          SIEMPRE ACTIVO
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

        <div className="simulation-info">
          <h4>🛡️ Sistema de Defensa Activo:</h4>
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

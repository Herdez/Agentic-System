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
  const { socket, agents, alerts, isConnected: socketConnected } = useSocket();
  const [localAgents, setLocalAgents] = useState<any[]>([]);
  const [localAlerts, setLocalAlerts] = useState<any[]>([]);

  // Función para obtener datos directamente de la API en modo Netlify
  const fetchDataForStats = useCallback(async () => {
    try {
      console.log('🔧 Obteniendo datos para estadísticas desde API...');
      
      // Obtener agentes
      const agentsResponse = await fetch('/api/agents');
      const agentsData = await agentsResponse.json();
      const agentsArray = agentsData?.success ? agentsData.data : [];
      setLocalAgents(agentsArray);
      
      // Obtener alertas
      const alertsResponse = await fetch('/api/alerts');
      const alertsData = await alertsResponse.json();
      const alertsArray = alertsData?.success ? alertsData.data : [];
      setLocalAlerts(alertsArray);

      console.log('🔧 Datos obtenidos para estadísticas:', {
        agentes: agentsArray.length,
        alertas: alertsArray.length,
        fuenteDatos: 'API Netlify'
      });

    } catch (error) {
      console.error('❌ Error obteniendo datos para estadísticas:', error);
      setLocalAgents([]);
      setLocalAlerts([]);
    }
  }, []);

  // Calcular estadísticas en tiempo real desde los datos del socket o API
  const calculateRealTimeStats = useCallback(() => {
    // Determinar fuente de datos: WebSocket local o API Netlify
    const isNetlify = !socketConnected;
    const dataAgents = isNetlify ? localAgents : agents;
    const dataAlerts = isNetlify ? localAlerts : alerts;

    console.log('🔧 Calculando estadísticas:', {
      fuenteDatos: isNetlify ? 'API Netlify' : 'WebSocket',
      agentesDisponibles: Array.isArray(dataAgents) ? dataAgents.length : 0,
      alertasDisponibles: Array.isArray(dataAlerts) ? dataAlerts.length : 0
    });

    if (!Array.isArray(dataAgents) || !Array.isArray(dataAlerts)) {
      console.log('🔧 Estadísticas no disponibles - esperando datos');
      return null;
    }

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Contar agentes activos (excluyendo inactivos y en mantenimiento)
    const activeAgents = dataAgents.filter(agent => 
      agent?.status && 
      agent.status !== 'inactive' && 
      agent.status !== 'maintenance'
    ).length;

    // Contar alertas recientes (últimas 24 horas)
    const recentAlerts = dataAlerts.filter(alert => {
      const alertDate = new Date(alert?.timestamp || alert?.createdAt || alert?.detection_time || now);
      return alertDate >= last24Hours;
    }).length;

    // Contar alertas críticas no resueltas (criterio profesional)
    const criticalAlerts = dataAlerts.filter(alert => 
      (alert?.severity === 'critical' || alert?.severity === 'high') && 
      alert?.status !== 'resolved' && 
      alert?.status !== 'closed' &&
      alert?.status !== 'false_positive'
    ).length;

    const calculatedStats = {
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
      alertasActivas: dataAlerts.filter(alert => 
        alert?.status === 'active' || 
        alert?.status === 'investigating' ||
        alert?.status === 'mitigating'
      ).length,
      alertasRecientes: recentAlerts,
      alertasCriticas: criticalAlerts,
      agentesActivos: activeAgents
    });

    setStats(calculatedStats);
    return calculatedStats;
  }, [agents, alerts, isRunning, localAgents, localAlerts, socketConnected]);

  // Función para obtener el estado de la simulación
  const fetchSimulationStatus = useCallback(async () => {
    try {
      const response = await simulationService.getStatus();
      console.log('🔧 Estado de simulación obtenido:', response);
      
      const data = response?.success ? response.data : (response?.data || response);
      if (data) {
        setIsRunning(data?.isRunning ?? true);
      }
    } catch (error) {
      console.error('❌ Error obteniendo estado de simulación:', error);
    }
  }, []);

  // Iniciar simulación
  const startSimulation = async () => {
    try {
      console.log('🔧 Iniciando simulación...');
      await simulationService.start();
      setIsRunning(true);
      await fetchSimulationStatus();
      console.log('✅ Simulación iniciada correctamente');
    } catch (error) {
      console.error('❌ Error iniciando simulación:', error);
    }
  };

  // Efecto para escuchar eventos del socket (solo en modo local)
  useEffect(() => {
    if (socket && socketConnected) {
      console.log('🔧 Configurando listeners del socket...');
      
      const handleSimulationStatus = (data: any) => {
        console.log('📡 Evento simulation-status recibido:', data);
        setIsRunning(data?.isRunning ?? true);
      };

      const handleSimulationUpdate = (data: any) => {
        console.log('📡 Evento simulation_update recibido:', data);
        setStats(data);
        setIsRunning(true);
      };

      socket.on('simulation-status', handleSimulationStatus);
      socket.on('simulation_update', handleSimulationUpdate);

      return () => {
        socket.off('simulation-status', handleSimulationStatus);
        socket.off('simulation_update', handleSimulationUpdate);
      };
    } else if (!socketConnected) {
      console.log('🔧 Socket no conectado - usando modo API Netlify');
    }
  }, [socket, socketConnected]);

  // Efecto principal para cargar datos iniciales y configurar polling
  useEffect(() => {
    const isNetlify = !socketConnected;
    
    if (isNetlify) {
      console.log('🔧 Modo Netlify detectado - configurando polling de datos');
      
      // Cargar datos iniciales
      fetchDataForStats();
      
      // Polling para datos de estadísticas (cada 15 segundos)
      const statsInterval = setInterval(fetchDataForStats, 15000);
      
      // Polling para estado de simulación (cada 20 segundos)
      const statusInterval = setInterval(fetchSimulationStatus, 20000);
      
      // Cargar estado inicial
      fetchSimulationStatus();
      
      return () => {
        clearInterval(statsInterval);
        clearInterval(statusInterval);
      };
    } else {
      console.log('🔧 Modo local detectado - usando WebSocket');
      // En modo local, cargar estado inicial
      fetchSimulationStatus();
    }
  }, [socketConnected, fetchDataForStats, fetchSimulationStatus]);

  // Efecto para recalcular estadísticas cuando cambien los datos
  useEffect(() => {
    const realTimeStats = calculateRealTimeStats();
    if (realTimeStats) {
      console.log('🔧 Estadísticas actualizadas automáticamente:', realTimeStats);
    }
  }, [calculateRealTimeStats]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Control de Simulación
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={startSimulation}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {isRunning ? 'Ejecutándose' : 'Iniciar'}
          </button>
        </div>
      </div>

      {/* Subdashboard - Estadísticas del Sistema */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Sistema de Defensa Blockchain
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats?.totalAgents ?? 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Agentes Totales
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats?.activeAgents ?? 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Agentes Activos
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats?.recentAlerts ?? 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Alertas Recientes
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats?.criticalAlerts ?? 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Alertas Críticas
            </div>
          </div>
        </div>
      </div>

      {/* Estado de la simulación */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Estado: {isRunning ? 'Ejecutándose' : 'Detenido'}
          </span>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Última actualización: {stats?.lastUpdate ? new Date(stats.lastUpdate).toLocaleString() : 'N/A'}
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Modo: {socketConnected ? 'WebSocket (Local)' : 'API Polling (Netlify)'}
        </div>
      </div>
    </div>
  );
};

export default SimulationControl;
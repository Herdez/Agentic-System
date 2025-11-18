import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Agent, Alert } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  alerts: Alert[];
  agents: Agent[];
  systemStats: any;
  emitAgentAction: (agentId: string, action: string) => void;
  emitNewAlert: (alert: Partial<Alert>) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Configuración dinámica de URL para producción
const getSocketUrl = () => {
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL;
  }
  
  // En producción, usar la URL actual
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin;
  }
  
  // En desarrollo, usar localhost
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [systemStats, setSystemStats] = useState<any>(null);

  useEffect(() => {
    // Crear conexión WebSocket
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Eventos de conexión
    socketInstance.on('connect', () => {
      console.log('🔌 Conectado a WebSocket:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Desconectado de WebSocket');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Error de conexión WebSocket:', error);
      setIsConnected(false);
    });

    // Eventos de datos iniciales
    socketInstance.on('initial-data', (data) => {
      console.log('📊 Datos iniciales recibidos:', data);
      if (data.agents) setAgents(data.agents);
      if (data.alerts) setAlerts(data.alerts);
      if (data.systemStats) setSystemStats(data.systemStats);
      if (data.demoMode) {
        console.log('🎮 Modo DEMO activado');
      }
    });

    // Eventos para modo demo
    socketInstance.on('demo-agents-update', (demoAgents: Agent[]) => {
      console.log('🎮 Actualización de agentes demo:', demoAgents);
      setAgents(demoAgents);
    });

    socketInstance.on('demo-alerts-update', (demoAlerts: Alert[]) => {
      console.log('🎮 Actualización de alertas demo:', demoAlerts);
      setAlerts(demoAlerts);
    });

    // Eventos de actualizaciones en tiempo real
    socketInstance.on('agent-update', (agent: Agent) => {
      console.log('🤖 Actualización de agente:', agent);
      setAgents(prevAgents => 
        prevAgents.map(a => a._id === agent._id ? agent : a)
      );
    });

    socketInstance.on('new-alert', (alert: Alert) => {
      console.log('🚨 Nueva alerta:', alert);
      setAlerts(prevAlerts => [alert, ...prevAlerts.slice(0, 49)]); // Mantener solo 50 alertas
    });

    socketInstance.on('alert-broadcast', (alert: Alert) => {
      console.log('📡 Broadcast de alerta:', alert);
      setAlerts(prevAlerts => [alert, ...prevAlerts.slice(0, 49)]);
    });

    socketInstance.on('critical-alert', (alert: Alert) => {
      console.log('🚨🚨 ALERTA CRÍTICA:', alert);
      setAlerts(prevAlerts => [alert, ...prevAlerts.slice(0, 49)]);
      
      // Mostrar notificación del navegador para alertas críticas
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⚠️ Alerta Crítica', {
          body: alert.message,
          icon: '/favicon.ico',
          tag: 'critical-alert',
        });
      }
    });

    socketInstance.on('system-stats-update', (stats: any) => {
      console.log('📊 Actualización de estadísticas:', stats);
      setSystemStats(stats);
    });

    // Eventos de error
    socketInstance.on('error', (error) => {
      console.error('❌ Error del socket:', error);
    });

    setSocket(socketInstance);

    // Solicitar permisos de notificación
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup al desmontar
    return () => {
      console.log('🔌 Cerrando conexión WebSocket');
      socketInstance.disconnect();
    };
  }, []);

  const emitAgentAction = useCallback((agentId: string, action: string) => {
    if (socket && isConnected) {
      socket.emit('agent-action', { agentId, action });
      console.log('🤖 Acción de agente enviada:', { agentId, action });
    }
  }, [socket, isConnected]);

  const emitNewAlert = useCallback((alert: Partial<Alert>) => {
    if (socket && isConnected) {
      socket.emit('new-alert', alert);
      console.log('🚨 Alerta enviada:', alert);
    }
  }, [socket, isConnected]);

  const value = {
    socket,
    isConnected,
    alerts,
    agents,
    systemStats,
    emitAgentAction,
    emitNewAlert,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

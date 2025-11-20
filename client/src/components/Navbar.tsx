import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Shield, Menu, X, Bell, User, LogOut } from 'lucide-react';
import { Alert } from '../types';
import { alertService } from '../services/api';

const Navbar: React.FC = () => {
  const { state: authState, logout } = useAuth();
  const { isConnected, alerts: socketAlerts } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [polledAlerts, setPolledAlerts] = useState<Alert[]>([]);
  
  // Detectar si estamos en modo Netlify
  const isNetlify = window.location.hostname.includes('netlify') || !window.location.hostname.includes('localhost');
  
  // Usar alertas de WebSocket si está conectado, sino usar polling
  const alerts = isConnected ? socketAlerts : polledAlerts;
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high').length;
  
  // Debug para verificar alertas críticas
  console.log('🔔 Navbar: Total alertas:', alerts.length, 'Críticas:', criticalAlerts);
  
  // Polling de alertas para modo Netlify
  useEffect(() => {
    if (!isNetlify || isConnected) return;
    
    const loadAlerts = async () => {
      try {
        const response = await alertService.getRecentAlerts(50); // Aumentar a 50
        const alertsData = response.success ? response.data : (response.data || response);
        if (alertsData && Array.isArray(alertsData)) {
          console.log('🔔 Navbar: Alertas recibidas:', alertsData.length);
          // Debug de severidades
          const severities = alertsData.map(a => a.severity).filter(Boolean);
          console.log('🔔 Severidades encontradas:', Array.from(new Set(severities)));
          setPolledAlerts(alertsData);
        }
      } catch (error) {
        console.error('Error loading alerts for navbar:', error);
      }
    };
    
    loadAlerts();
    const interval = setInterval(loadAlerts, 10000); // Cada 10 segundos
    
    return () => clearInterval(interval);
  }, [isNetlify, isConnected]);

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
      if (!target.closest('.notification-menu')) {
        setIsNotificationOpen(false);
      }
    };

    if (isUserMenuOpen || isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, isNotificationOpen]);

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Agentes', path: '/agents', icon: '🤖' },
    { name: 'Alertas', path: '/alerts', icon: '🚨' },
    { name: 'Amenazas', path: '/threats', icon: '🔍' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActivePage = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y título */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                Blockchain Defense
              </span>
            </Link>
          </div>

          {/* Navegación desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActivePage(item.path)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>

          {/* Estado y usuario */}
          <div className="flex items-center space-x-4">
            {/* Estado de conexión */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-gray-600 hidden sm:block">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>

            {/* Notificaciones */}
            <div className="relative notification-menu">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {criticalAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {criticalAlerts}
                  </span>
                )}
              </button>

              {/* Dropdown de notificaciones */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Alertas Recientes ({alerts.length})
                    </h3>
                  </div>
                  
                  {alerts.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No hay alertas disponibles
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto">
                      {alerts.slice(0, 10).map((alert, index) => (
                        <div 
                          key={alert._id || index} 
                          className="p-3 border-b border-gray-100 hover:bg-gray-50 last:border-b-0"
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              alert.severity === 'critical' ? 'bg-red-500' :
                              alert.severity === 'high' ? 'bg-orange-500' :
                              alert.severity === 'medium' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {alert.name || alert.message || alert.title || 'Alerta de seguridad'}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {alert.severity?.toUpperCase()} • {new Date(
                                  alert.createdAt || alert.timestamp || (alert as any).detection_time || new Date()
                                ).toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="p-3 bg-gray-50 text-center">
                    <Link 
                      to="/alerts" 
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => setIsNotificationOpen(false)}
                    >
                      Ver todas las alertas →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Usuario */}
            <div className="relative user-menu">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:block text-sm font-medium">
                  {authState.user?.username || 'Usuario'}
                </span>
              </button>
              
              {/* Dropdown menu */}
              {isUserMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{authState.user?.username}</p>
                      <p className="text-xs text-gray-500">{authState.user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Menú móvil toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Navegación móvil */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-200 animate-fade-in">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActivePage(item.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

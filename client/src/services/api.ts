import axios from 'axios';
import { ApiResponse, Agent, Alert, Threat, SystemStats, NetworkTopology, User } from '../types';

// Configuración dinámica de URL para producción
const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // En producción, detectar si estamos en Netlify
  if (process.env.NODE_ENV === 'production') {
    const hostname = window.location.hostname;
    if (hostname.includes('netlify.app') || hostname.includes('netlify.com')) {
      return window.location.origin + '/.netlify/functions/api';
    }
    return window.location.origin + '/api';
  }
  
  // En desarrollo, usar localhost
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiUrl();

// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de Agentes
export const agentService = {
  getAllAgents: (): Promise<ApiResponse<Agent[]>> =>
    api.get('/agents').then(res => res.data),
    
  getAgentById: (id: string): Promise<ApiResponse<Agent>> =>
    api.get(`/agents/${id}`).then(res => res.data),
    
  createAgent: (agentData: Partial<Agent>): Promise<ApiResponse<Agent>> =>
    api.post('/agents', agentData).then(res => res.data),
    
  executeAgentAction: (agentId: string, action: string): Promise<ApiResponse<Agent>> =>
    api.put(`/agents/${agentId}/action`, { action }).then(res => res.data),
    
  updateAgentMetrics: (agentId: string, metrics: Partial<Agent['metrics']>): Promise<ApiResponse<Agent>> =>
    api.put(`/agents/${agentId}/metrics`, metrics).then(res => res.data),
    
  getAgentsByType: (type: string): Promise<ApiResponse<Agent[]>> =>
    api.get(`/agents/type/${type}`).then(res => res.data),
    
  getSystemStats: (): Promise<ApiResponse<SystemStats>> =>
    api.get('/dashboard').then(res => res.data),
    
  initializeAgents: (): Promise<ApiResponse<Agent[]>> =>
    api.post('/agents/initialize').then(res => res.data),
    
  simulateActivity: (): Promise<ApiResponse<any>> =>
    api.post('/agents/simulate').then(res => res.data),
};

// Servicios de Alertas
export const alertService = {
  getRecentAlerts: (limit?: number): Promise<ApiResponse<Alert[]>> =>
    api.get('/alerts', { params: { limit } }).then(res => res.data),
    
  getCriticalAlerts: (): Promise<ApiResponse<Alert[]>> =>
    api.get('/alerts/critical').then(res => res.data),
    
  getAlertsBySeverity: (severity: string): Promise<ApiResponse<Alert[]>> =>
    api.get(`/alerts/severity/${severity}`).then(res => res.data),
    
  getAlertsByAgent: (agentId: string): Promise<ApiResponse<Alert[]>> =>
    api.get(`/alerts/agent/${agentId}`).then(res => res.data),
    
  getAlertsByType: (agentType: string): Promise<ApiResponse<Alert[]>> =>
    api.get(`/alerts/type/${agentType}`).then(res => res.data),
    
  getAlertStats: (timeframe?: number): Promise<ApiResponse<any>> =>
    api.get('/alerts/stats', { params: { timeframe } }).then(res => res.data),
    
  getAlertTrends: (days?: number): Promise<ApiResponse<any[]>> =>
    api.get('/alerts/trends', { params: { days } }).then(res => res.data),
    
  getGeographicAlerts: (): Promise<ApiResponse<any[]>> =>
    api.get('/alerts/geographic').then(res => res.data),
    
  searchAlerts: (query: string, limit?: number): Promise<ApiResponse<Alert[]>> =>
    api.get('/alerts/search', { params: { q: query, limit } }).then(res => res.data),
    
  createAlert: (alertData: Partial<Alert>): Promise<ApiResponse<Alert>> =>
    api.post('/alerts', alertData).then(res => res.data),
    
  resolveAlert: (alertId: string, resolvedBy: string, resolution: string): Promise<ApiResponse<Alert>> =>
    api.put(`/alerts/${alertId}/resolve`, { resolvedBy, resolution }).then(res => res.data),
    
  escalateAlert: (alertId: string): Promise<ApiResponse<Alert>> =>
    api.put(`/alerts/${alertId}/escalate`).then(res => res.data),
    
  updateAlertStatus: (alertId: string, status: string, updateData?: any): Promise<ApiResponse<Alert>> =>
    api.put(`/alerts/${alertId}/status`, { status, ...updateData }).then(res => res.data),
    
  markAsFalsePositive: (alertId: string, reason?: string): Promise<ApiResponse<Alert>> =>
    api.put(`/alerts/${alertId}/false-positive`, { reason }).then(res => res.data),
    
  addRecommendedAction: (alertId: string, action: string, priority?: number): Promise<ApiResponse<Alert>> =>
    api.post(`/alerts/${alertId}/action`, { action, priority }).then(res => res.data),
};

// Servicios de Amenazas
export const threatService = {
  getAllThreats: (params?: { severity?: string; limit?: number; source?: string }): Promise<ApiResponse<Threat[]>> =>
    api.get('/threats', { params }).then(res => res.data),
    
  getThreatById: (id: string): Promise<ApiResponse<Threat>> =>
    api.get(`/threats/${id}`).then(res => res.data),
    
  getThreatStats: (): Promise<ApiResponse<any>> =>
    api.get('/threats/stats/overview').then(res => res.data),
    
  searchThreats: (searchData: { indicators?: string[]; threatType?: string; minConfidence?: number }): Promise<ApiResponse<Threat[]>> =>
    api.post('/threats/search', searchData).then(res => res.data),
    
  createThreat: (threatData: Partial<Threat>): Promise<ApiResponse<Threat>> =>
    api.post('/threats', threatData).then(res => res.data),
    
  updateThreatConfidence: (threatId: string, confidence: number): Promise<ApiResponse<Threat>> =>
    api.put(`/threats/${threatId}/confidence`, { confidence }).then(res => res.data),
    
  getActiveFeeds: (): Promise<ApiResponse<any[]>> =>
    api.get('/threats/feeds/active').then(res => res.data),
};

// Servicios de Autenticación
export const authService = {
  login: (credentials: { username: string; password: string }): Promise<ApiResponse<{ token: string; user: User }>> =>
    api.post('/auth/login', credentials).then(res => res.data),
    
  logout: (): Promise<ApiResponse<any>> =>
    api.post('/auth/logout').then(res => res.data),
    
  getProfile: (): Promise<ApiResponse<User>> =>
    api.get('/auth/profile').then(res => res.data),
    
  updateProfile: (profileData: { email?: string }): Promise<ApiResponse<User>> =>
    api.put('/auth/profile', profileData).then(res => res.data),
    
  changePassword: (passwordData: { currentPassword: string; newPassword: string }): Promise<ApiResponse<any>> =>
    api.post('/auth/change-password', passwordData).then(res => res.data),
    
  getUsers: (): Promise<ApiResponse<User[]>> =>
    api.get('/auth/users').then(res => res.data),
};

// Servicios de Dashboard
export const dashboardService = {
  getDashboardData: (): Promise<ApiResponse<any>> =>
    api.get('/dashboard').then(res => res.data),
    
  getRealtimeData: (): Promise<ApiResponse<any>> =>
    api.get('/dashboard/realtime').then(res => res.data),
    
  getMetrics: (period?: string): Promise<ApiResponse<any>> =>
    api.get('/dashboard/metrics', { params: { period } }).then(res => res.data),
    
  getNetworkTopology: (): Promise<ApiResponse<NetworkTopology>> =>
    api.get('/dashboard/network-topology').then(res => res.data),
};

// Servicio de salud del sistema
export const healthService = {
  getHealthCheck: (): Promise<ApiResponse<any>> =>
    api.get('/health').then(res => res.data),
};

// Servicios de Simulación
export const simulationService = {
  getStatus: (): Promise<ApiResponse<any>> =>
    api.get('/simulation/status').then(res => res.data),
    
  start: (): Promise<ApiResponse<any>> =>
    api.post('/simulation/start').then(res => res.data),
    
  stop: (): Promise<ApiResponse<any>> =>
    api.post('/simulation/stop').then(res => res.data),
    
  restart: (): Promise<ApiResponse<any>> =>
    api.post('/simulation/restart').then(res => res.data),
};

export default api;

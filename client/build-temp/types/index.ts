export interface Agent {
  _id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  description: string;
  capabilities: string[];
  metrics: {
    threatsDetected: number;
    actionsExecuted: number;
    uptime: number;
    responseTime: number;
    accuracy: number;
  };
  configuration: {
    priority: number;
    autoResponse: boolean;
    alertThreshold: number;
  };
  lastActivity: string;
  networkLocation: {
    region: string;
    node: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export type AgentType = 
  | 'intrusion_detection'
  | 'incident_response'
  | 'vulnerability_analysis'
  | 'threat_intelligence'
  | 'defense_coordination'
  | 'audit_compliance'
  | 'recovery_resilience';

export type AgentStatus = 'active' | 'inactive' | 'maintenance' | 'error' | 'scanning';

export interface Alert {
  _id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  description?: string;
  agentId?: string;
  agentType?: AgentType;
  source: string;
  category: AlertCategory;
  status: AlertStatus;
  priority: number;
  details: Record<string, any>;
  affectedSystems: string[];
  recommendedActions: RecommendedAction[];
  resolution?: {
    resolvedBy: string;
    resolvedAt: string;
    resolution: string;
    timeToResolve: number;
  };
  tags: string[];
  geolocation?: {
    country: string;
    region: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
    correlationId?: string;
  };
  // Nuevas propiedades para compatibilidad con Netlify
  name?: string;
  title?: string;
  threat_type?: string;
  threat_icon?: string;
  timestamp?: string;
  confidence?: number;
  risk_score?: number;
  source_ip?: string;
  attempts_blocked?: number;
  detection_time?: string;
  createdAt: string;
  updatedAt: string;
}

export type AlertType = 'INFO' | 'WARNING' | 'CRITICAL' | 'ERROR';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type AlertCategory = 
  | 'security_breach'
  | 'network_anomaly'
  | 'system_update'
  | 'threat_detected'
  | 'vulnerability_found'
  | 'compliance_violation'
  | 'performance_issue'
  | 'maintenance_required';

export type AlertStatus = 'open' | 'investigating' | 'resolved' | 'closed' | 'false_positive';

export interface RecommendedAction {
  action: string;
  priority: number;
  completed: boolean;
}

export interface Threat {
  id: string;
  name: string;
  type: string;
  severity: AlertSeverity;
  description: string;
  indicators: string[];
  lastSeen: string;
  confidence: number;
  source: string;
}

export interface SystemStats {
  agents: {
    total: number;
    active: number;
    inactive?: number;
    maintenance?: number;
    error?: number;
    investigating?: number;
    responding?: number;
    scanning?: number;
    monitoring?: number;
    healthPercentage?: number;
    average_activity?: number;
    total_threats_detected?: number;
    total_actions_executed?: number;
  };
  alerts: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    open?: number;
    active?: number;
    resolved: number;
    investigating?: number;
    mitigating?: number;
    avgTimeToResolve?: number;
  };
  threats?: {
    total_detected?: number;
    blocked?: number;
    mitigated?: number;
    active_threats?: number;
    neutralized_today?: number;
    prevention_rate?: number;
  };
  security_metrics?: {
    threat_detection_rate?: number;
    false_positive_rate?: number;
    response_efficiency?: number;
    system_resilience?: number;
    threat_intelligence_score?: number;
    incident_resolution_time?: number;
    network_security_level?: number;
    data_protection_index?: number;
  };
  system?: {
    uptime?: number;
    cpu_usage?: number;
    memory_usage?: number;
    disk_usage?: number;
    network_traffic?: number;
    bandwidth_utilization?: number;
    connection_count?: number;
    last_update?: string;
  };
  performance?: {
    response_time?: number;
    throughput?: number;
    error_rate?: number;
    availability?: number;
    latency_p99?: number;
    success_rate?: number;
  };
  network?: {
    nodesActive?: number;
    transactionsPerSecond?: number;
    blockHeight?: number;
    hashRate?: number;
    networkLatency?: number;
    uptime?: number;
    threatLevel?: ThreatLevel;
  };
  timestamp?: string;
  lastUpdate?: string;
}

export type ThreatLevel = 'MINIMAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
}

export type UserRole = 'admin' | 'analyst' | 'operator';

export type Permission = 
  | 'read'
  | 'write'
  | 'delete'
  | 'manage_agents'
  | 'manage_users'
  | 'manage_alerts';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  count?: number;
  total?: number;
}

export interface NetworkNode {
  id: string;
  name: string;
  type: 'hub' | 'validator';
  status: 'active' | 'maintenance' | 'error';
  connections: number;
}

export interface NetworkConnection {
  source: string;
  target: string;
  strength: number;
  latency: number;
}

export interface NetworkTopology {
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  stats: {
    totalNodes: number;
    activeNodes: number;
    maintenanceNodes: number;
    avgLatency: number;
    networkHealth: number;
  };
}

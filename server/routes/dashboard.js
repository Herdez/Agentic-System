const express = require('express');
const router = express.Router();
const AgentService = require('../services/AgentService');
const AlertService = require('../services/AlertService');
const DemoSimulationService = require('../services/DemoSimulationService');

// Función para detectar modo demo
const isDemoMode = () => {
  return process.env.SKIP_MONGODB === 'true' || !process.env.MONGODB_URI || process.env.NODE_ENV === 'demo';
};

// GET /api/dashboard - Obtener datos completos del dashboard
router.get('/', async (req, res) => {
  try {
    const demoMode = isDemoMode();
    let systemStats, recentAlerts, criticalAlerts;
    
    if (demoMode) {
      // Usar datos demo
      const demoAgents = DemoSimulationService.getDemoAgents();
      const demoAlerts = DemoSimulationService.getDemoAlerts();
      
      systemStats = {
        totalAgents: demoAgents.length,
        activeAgents: demoAgents.filter(a => a.status === 'active').length,
        threatsDetected: demoAgents.reduce((sum, agent) => sum + (agent.metrics?.threatsDetected || 0), 0),
        incidentsResolved: demoAgents.reduce((sum, agent) => sum + (agent.metrics?.incidentsResolved || 0), 0),
        systemUptime: 99.8,
        responseTime: 0.3,
        lastUpdate: new Date()
      };
      
      recentAlerts = demoAlerts.slice(-10);
      criticalAlerts = demoAlerts.filter(a => a.severity === 'critical');
    } else {
      // Usar base de datos real
      [systemStats, recentAlerts, criticalAlerts] = await Promise.all([
        AgentService.getSystemStats(),
        AlertService.getRecentAlerts(10),
        AlertService.getCriticalAlerts()
      ]);
    }
    
    // Datos adicionales del dashboard
    const dashboardData = {
      systemStats,
      recentAlerts,
      criticalAlerts,
      networkMap: generateNetworkMap(),
      threatTimeline: generateThreatTimeline(),
      agentPerformance: generateAgentPerformance(),
      demoMode,
      lastUpdate: new Date()
    };
    
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error obteniendo dashboard:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/dashboard/realtime - Obtener datos en tiempo real
router.get('/realtime', async (req, res) => {
  try {
    const realtimeData = {
      timestamp: new Date(),
      networkActivity: {
        transactionsPerSecond: Math.floor(Math.random() * 500) + 1000,
        activeConnections: Math.floor(Math.random() * 100) + 500,
        bandwidthUsage: Math.floor(Math.random() * 40) + 60, // 60-100%
        cpuUsage: Math.floor(Math.random() * 30) + 20, // 20-50%
        memoryUsage: Math.floor(Math.random() * 25) + 45, // 45-70%
      },
      threatLevel: calculateCurrentThreatLevel(),
      activeThreats: Math.floor(Math.random() * 5) + 1,
      blockedAttacks: Math.floor(Math.random() * 20) + 50,
      systemHealth: Math.floor(Math.random() * 5) + 95 // 95-100%
    };
    
    res.json({
      success: true,
      data: realtimeData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/dashboard/metrics - Obtener métricas específicas
router.get('/metrics', async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    const metrics = {
      period,
      data: generateMetricsData(period),
      performance: {
        avgResponseTime: Math.round(Math.random() * 200 + 100), // 100-300ms
        throughput: Math.floor(Math.random() * 1000) + 2000,
        errorRate: Math.round(Math.random() * 0.5 * 100) / 100, // 0-0.5%
        availability: Math.round((99 + Math.random()) * 100) / 100 // 99-100%
      },
      alerts: await AlertService.getAlertStatistics(period === '24h' ? 24 : period === '7d' ? 168 : 720),
      trends: generateTrendData(period)
    };
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/dashboard/network-topology - Obtener topología de red
router.get('/network-topology', async (req, res) => {
  try {
    const topology = {
      nodes: [
        { id: 'central-hub', name: 'Central Hub', type: 'hub', status: 'active', connections: 6 },
        { id: 'node-001', name: 'US-East Node', type: 'validator', status: 'active', connections: 3 },
        { id: 'node-002', name: 'EU-West Node', type: 'validator', status: 'active', connections: 4 },
        { id: 'node-003', name: 'Asia-East Node', type: 'validator', status: 'maintenance', connections: 2 },
        { id: 'node-004', name: 'US-West Node', type: 'validator', status: 'active', connections: 5 },
        { id: 'node-005', name: 'EU-Central Node', type: 'validator', status: 'active', connections: 3 },
        { id: 'node-006', name: 'Canada-Central Node', type: 'validator', status: 'active', connections: 2 },
        { id: 'node-007', name: 'Australia-East Node', type: 'validator', status: 'active', connections: 4 }
      ],
      connections: [
        { source: 'central-hub', target: 'node-001', strength: 95, latency: 45 },
        { source: 'central-hub', target: 'node-002', strength: 92, latency: 120 },
        { source: 'central-hub', target: 'node-003', strength: 87, latency: 180 },
        { source: 'central-hub', target: 'node-004', strength: 94, latency: 80 },
        { source: 'node-001', target: 'node-004', strength: 88, latency: 65 },
        { source: 'node-002', target: 'node-005', strength: 96, latency: 25 },
        { source: 'node-005', target: 'node-006', strength: 91, latency: 90 }
      ],
      stats: {
        totalNodes: 8,
        activeNodes: 7,
        maintenanceNodes: 1,
        avgLatency: 86,
        networkHealth: 94
      }
    };
    
    res.json({
      success: true,
      data: topology
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Funciones auxiliares
function generateNetworkMap() {
  return {
    regions: [
      { name: 'North America', nodes: 3, status: 'healthy', threats: 2 },
      { name: 'Europe', nodes: 2, status: 'healthy', threats: 1 },
      { name: 'Asia Pacific', nodes: 2, status: 'warning', threats: 3 },
      { name: 'Latin America', nodes: 1, status: 'healthy', threats: 0 }
    ],
    globalStats: {
      totalRegions: 4,
      healthyRegions: 3,
      warningRegions: 1,
      criticalRegions: 0
    }
  };
}

function generateThreatTimeline() {
  const timeline = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    timeline.push({
      time: hour,
      threats: Math.floor(Math.random() * 10) + 1,
      blocked: Math.floor(Math.random() * 8) + 2,
      investigated: Math.floor(Math.random() * 3) + 1
    });
  }
  
  return timeline;
}

function generateAgentPerformance() {
  const agentTypes = [
    'intrusion_detection',
    'incident_response', 
    'vulnerability_analysis',
    'threat_intelligence',
    'defense_coordination',
    'audit_compliance',
    'recovery_resilience'
  ];
  
  return agentTypes.map(type => ({
    type,
    efficiency: Math.floor(Math.random() * 20) + 80, // 80-100%
    threatsDetected: Math.floor(Math.random() * 50) + 10,
    responseTime: Math.round((Math.random() * 0.5 + 0.2) * 100) / 100, // 0.2-0.7s
    accuracy: Math.floor(Math.random() * 10) + 90 // 90-100%
  }));
}

function calculateCurrentThreatLevel() {
  const levels = ['MINIMAL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const weights = [0.4, 0.3, 0.2, 0.08, 0.02]; // Probabilidades
  
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < levels.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      return levels[i];
    }
  }
  
  return 'MINIMAL';
}

function generateMetricsData(period) {
  const dataPoints = period === '24h' ? 24 : period === '7d' ? 7 : 30;
  const data = [];
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    const timestamp = new Date();
    
    if (period === '24h') {
      timestamp.setHours(timestamp.getHours() - i);
    } else if (period === '7d') {
      timestamp.setDate(timestamp.getDate() - i);
    } else {
      timestamp.setDate(timestamp.getDate() - i);
    }
    
    data.push({
      timestamp,
      transactions: Math.floor(Math.random() * 500) + 1000,
      threats: Math.floor(Math.random() * 15) + 5,
      responseTime: Math.round((Math.random() * 0.3 + 0.2) * 100) / 100,
      networkHealth: Math.floor(Math.random() * 10) + 90
    });
  }
  
  return data;
}

function generateTrendData(period) {
  return {
    threatTrend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
    performanceTrend: Math.random() > 0.7 ? 'improving' : 'stable',
    alertTrend: Math.random() > 0.6 ? 'decreasing' : 'stable',
    networkTrend: 'stable'
  };
}

module.exports = router;

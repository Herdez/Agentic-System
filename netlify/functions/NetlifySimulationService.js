// Simulación stateless para Netlify Functions
class NetlifySimulationService {
  constructor() {
    this.agentTypes = [
      { id: 'monitor', name: '🕵️ Monitor de Red', status: 'active' },
      { id: 'firewall', name: '🛡️ Firewall Inteligente', status: 'active' },
      { id: 'detector', name: '🔍 Detector de Anomalías', status: 'active' },
      { id: 'responder', name: '⚡ Respuesta de Incidentes', status: 'active' },
      { id: 'analyst', name: '📊 Analista de Amenazas', status: 'active' },
      { id: 'auditor', name: '🔐 Auditor de Seguridad', status: 'active' },
      { id: 'coordinator', name: '🤝 Coordinador', status: 'active' }
    ];

    this.threatTypes = [
      'DDoS Attack', 'SQL Injection', 'Cross-Site Scripting', 'Brute Force',
      'Malware Detection', 'Phishing Attempt', 'Ransomware', 'Data Breach',
      'Unauthorized Access', 'Network Intrusion', 'Crypto Mining', 'Bot Activity'
    ];

    this.locations = [
      'Server-01', 'Database-Main', 'API-Gateway', 'Load-Balancer',
      'Firewall-DMZ', 'Internal-Network', 'User-Endpoint', 'Cloud-Instance'
    ];
  }

  // Generar agentes con datos dinámicos basados en timestamp
  getAgents() {
    const now = Date.now();
    return this.agentTypes.map((agent, index) => {
      // Usar timestamp para generar datos "aleatorios" pero consistentes
      const seed = now + index * 1000;
      const activityLevel = Math.sin(seed / 10000) * 50 + 50; // 0-100
      const threatsDetected = Math.floor(Math.sin(seed / 5000) * 10 + 15); // 5-25
      const lastActivity = new Date(now - (Math.abs(Math.sin(seed)) * 3600000)); // Última hora

      return {
        id: agent.id,
        name: agent.name,
        type: agent.id,
        status: agent.status,
        activity_level: Math.round(activityLevel),
        threats_detected: threatsDetected,
        last_activity: lastActivity.toISOString(),
        location: this.locations[index],
        version: '2.1.0',
        uptime: Math.floor(now / 1000) % 86400, // Segundos del día
        cpu_usage: Math.round(Math.sin(seed / 7000) * 20 + 30), // 10-50%
        memory_usage: Math.round(Math.sin(seed / 8000) * 30 + 40) // 10-70%
      };
    });
  }

  // Generar alertas dinámicas
  getAlerts() {
    const now = Date.now();
    const alerts = [];
    const alertCount = 8; // Número fijo de alertas

    for (let i = 0; i < alertCount; i++) {
      const seed = now + i * 2000;
      const severities = ['low', 'medium', 'high', 'critical'];
      const statuses = ['active', 'investigating', 'resolved'];
      
      const severity = severities[Math.abs(Math.floor(Math.sin(seed) * 4)) % 4];
      const status = statuses[Math.abs(Math.floor(Math.sin(seed * 1.1) * 3)) % 3];
      const threat = this.threatTypes[Math.abs(Math.floor(Math.sin(seed * 1.2) * this.threatTypes.length)) % this.threatTypes.length];
      const source = this.locations[Math.abs(Math.floor(Math.sin(seed * 1.3) * this.locations.length)) % this.locations.length];
      const agent = this.agentTypes[Math.abs(Math.floor(Math.sin(seed * 1.4) * this.agentTypes.length)) % this.agentTypes.length];

      // Timestamp para que las alertas cambien cada minuto
      const minutesSeed = Math.floor(now / 60000);
      const alertTime = new Date(now - (Math.abs(Math.sin(seed + minutesSeed)) * 7200000)); // Últimas 2 horas

      alerts.push({
        id: `alert-${i + 1}`,
        title: `${threat} Detected`,
        description: `${severity.charAt(0).toUpperCase() + severity.slice(1)} threat detected by ${agent.name}`,
        severity,
        status,
        source,
        timestamp: alertTime.toISOString(),
        agent_id: agent.id,
        threat_type: threat,
        confidence: Math.round(Math.sin(seed * 1.5) * 20 + 80), // 60-100%
        risk_score: Math.round(Math.sin(seed * 1.6) * 40 + 30), // 10-70%
        affected_systems: [source],
        mitigation_status: status === 'resolved' ? 'completed' : 'in_progress'
      });
    }

    return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Simular estado de simulación
  getSimulationStatus() {
    const now = Date.now();
    const minutesSeed = Math.floor(now / 60000);
    
    return {
      isRunning: true, // Siempre "corriendo" en modo demo
      agentsCount: 7,
      alertsCount: this.getAlerts().length,
      uptime: Math.floor((now % (24 * 3600000)) / 1000), // Segundos del día
      startTime: new Date(now - (now % (24 * 3600000))).toISOString(), // Inicio del día
      lastUpdate: new Date().toISOString(),
      mode: 'netlify-stateless'
    };
  }

  // Estadísticas del sistema
  getSystemStats() {
    const agents = this.getAgents();
    const alerts = this.getAlerts();
    const now = Date.now();
    const seed = Math.floor(now / 60000); // Cambiar cada minuto

    const totalThreats = agents.reduce((sum, agent) => sum + agent.threats_detected, 0);
    const activeAlerts = alerts.filter(alert => alert.status === 'active').length;
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical').length;

    return {
      agents: {
        total: agents.length,
        active: agents.filter(a => a.status === 'active').length,
        average_activity: Math.round(agents.reduce((sum, a) => sum + a.activity_level, 0) / agents.length)
      },
      alerts: {
        total: alerts.length,
        active: activeAlerts,
        critical: criticalAlerts,
        resolved: alerts.filter(alert => alert.status === 'resolved').length
      },
      threats: {
        total_detected: totalThreats,
        blocked: Math.floor(totalThreats * 0.85),
        mitigated: Math.floor(totalThreats * 0.95),
        active_threats: Math.max(0, Math.floor(totalThreats * 0.05))
      },
      system: {
        uptime: Math.floor((now % (24 * 3600000)) / 1000),
        cpu_usage: Math.round(Math.sin(seed * 0.1) * 20 + 45), // 25-65%
        memory_usage: Math.round(Math.sin(seed * 0.15) * 25 + 50), // 25-75%
        network_traffic: Math.round(Math.sin(seed * 0.2) * 1000 + 2000), // 1000-3000 MB/s
        last_update: new Date().toISOString()
      },
      performance: {
        response_time: Math.round(Math.sin(seed * 0.3) * 50 + 100), // 50-150ms
        throughput: Math.round(Math.sin(seed * 0.25) * 500 + 1500), // 1000-2000 req/s
        error_rate: Math.round(Math.sin(seed * 0.35) * 2 + 1), // 0-3%
        availability: 99.9 + Math.sin(seed * 0.1) * 0.05 // 99.85-99.95%
      }
    };
  }

  // Métodos para compatibilidad con la API existente
  initializeAgents() {
    return { message: 'Agentes inicializados en modo Netlify', count: 7 };
  }

  startSimulation() {
    return { message: 'Simulación activa en modo stateless', timestamp: new Date().toISOString() };
  }

  stopSimulation() {
    return { message: 'Simulación en modo stateless - no se puede detener', timestamp: new Date().toISOString() };
  }

  restartSimulation() {
    return { message: 'Simulación reiniciada en modo stateless', timestamp: new Date().toISOString() };
  }

  isSimulationRunning() {
    return true; // Siempre "corriendo" en modo demo
  }

  getUptime() {
    return Math.floor((Date.now() % (24 * 3600000)) / 1000);
  }
}

module.exports = NetlifySimulationService;

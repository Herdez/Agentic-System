// Servicio de simulación en modo demo (sin base de datos)
class DemoSimulationService {
  constructor() {
    this.isRunning = false;
    this.simulationInterval = null;
    this.attackInterval = null;
    this.socketIO = null;
    this.demoAgents = [
      {
        _id: 'demo-001',
        name: 'Detector de Intrusos Alpha',
        type: 'intrusion_detection',
        status: 'active',
        metrics: { threatsDetected: 127, uptime: 99.3, responseTime: 0.4, incidentsResolved: 0 }
      },
      {
        _id: 'demo-002',
        name: 'Coordinador de Respuesta Beta',
        type: 'incident_response',
        status: 'active',
        metrics: { threatsDetected: 0, uptime: 98.7, responseTime: 0.2, incidentsResolved: 43 }
      },
      {
        _id: 'demo-003',
        name: 'Analizador de Vulnerabilidades Gamma',
        type: 'vulnerability_analysis',
        status: 'active',
        metrics: { threatsDetected: 0, uptime: 99.8, responseTime: 0.7, vulnerabilitiesFound: 23 }
      },
      {
        _id: 'demo-004',
        name: 'Intel de Amenazas Delta',
        type: 'threat_intelligence',
        status: 'active',
        metrics: { threatsDetected: 0, uptime: 99.1, responseTime: 0.3, threatIntelUpdates: 156 }
      },
      {
        _id: 'demo-005',
        name: 'Coordinador de Defensa Epsilon',
        type: 'defense_coordination',
        status: 'active',
        metrics: { threatsDetected: 0, uptime: 99.9, responseTime: 0.1, coordinationActions: 89 }
      },
      {
        _id: 'demo-006',
        name: 'Auditor de Cumplimiento Zeta',
        type: 'audit_compliance',
        status: 'active',
        metrics: { threatsDetected: 0, uptime: 98.2, responseTime: 0.5, complianceChecks: 67 }
      },
      {
        _id: 'demo-007',
        name: 'Especialista en Recuperación Eta',
        type: 'recovery_resilience',
        status: 'active',
        metrics: { threatsDetected: 0, uptime: 99.5, responseTime: 0.3, backupsCompleted: 134 }
      }
    ];
    this.alerts = [];
  }

  setSocketIO(io) {
    this.socketIO = io;
  }

  startSimulation() {
    if (this.isRunning) {
      console.log('⚠️ Simulación demo ya está ejecutándose');
      return false;
    }

    console.log('🎮 Iniciando simulación demo de agentes...');
    this.isRunning = true;

    // Simular actividad cada 3 segundos
    this.simulationInterval = setInterval(() => {
      this.runSimulationCycle();
    }, 3000);

    // Simular ataques ocasionales cada 15 segundos
    this.attackInterval = setInterval(() => {
      if (Math.random() < 0.7) {
        this.simulateAttackScenario();
      }
    }, 15000);

    // Emitir estado de inicio
    if (this.socketIO) {
      this.socketIO.emit('simulation-status', { running: true });
    }

    return true;
  }

  stopSimulation() {
    if (!this.isRunning) {
      console.log('⚠️ Simulación demo no está ejecutándose');
      return false;
    }

    console.log('⏹️ Deteniendo simulación demo...');
    this.isRunning = false;

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }

    if (this.attackInterval) {
      clearInterval(this.attackInterval);
      this.attackInterval = null;
    }

    // Emitir estado de parada
    if (this.socketIO) {
      this.socketIO.emit('simulation-status', { running: false });
    }

    return true;
  }

  runSimulationCycle() {
    try {
      // Simular actividad de agentes
      this.demoAgents.forEach(agent => {
        // Actualizar métricas aleatoriamente
        agent.metrics.uptime = Math.max(95, Math.min(100, agent.metrics.uptime + (Math.random() - 0.5) * 2));
        agent.metrics.responseTime = Math.max(0.1, Math.min(2.0, agent.metrics.responseTime + (Math.random() - 0.5) * 0.2));
      });

      // Ocasionalmente generar una alerta
      if (Math.random() < 0.4) { // 40% probabilidad
        this.generateAlert();
      }

      // Emitir actualizaciones
      if (this.socketIO) {
        this.socketIO.emit('demo-agents-update', this.demoAgents);
        this.socketIO.emit('demo-alerts-update', this.alerts.slice(-10));
      }

    } catch (error) {
      console.error('❌ Error en ciclo de simulación demo:', error);
    }
  }

  generateAlert() {
    const alertTypes = [
      'Brute force attack detected',
      'SQL injection attempt blocked',
      'Suspicious file upload prevented',
      'Port scanning activity identified',
      'Malware signature detected',
      'Vulnerability scan completed',
      'Backup verification successful',
      'Compliance check passed',
      'Threat intelligence updated',
      'System coordination improved'
    ];

    const severities = ['low', 'medium', 'high', 'critical'];
    const agentTypes = ['intrusion_detection', 'incident_response', 'vulnerability_analysis', 
                       'threat_intelligence', 'defense_coordination', 'audit_compliance', 
                       'recovery_resilience'];

    const alert = {
      _id: 'demo-alert-' + Date.now(),
      type: Math.random() < 0.1 ? 'CRITICAL' : 'WARNING',
      message: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      agentType: agentTypes[Math.floor(Math.random() * agentTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      status: 'open',
      createdAt: new Date(),
      details: {
        automated: true,
        confidence: Math.round(Math.random() * 30 + 70),
        sourceIP: this.generateRandomIP(),
        timestamp: new Date()
      }
    };

    this.alerts.push(alert);
    
    // Mantener solo las últimas 50 alertas
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }

    // Actualizar métricas del agente correspondiente
    const agent = this.demoAgents.find(a => a.type === alert.agentType);
    if (agent) {
      switch (alert.agentType) {
        case 'intrusion_detection':
          agent.metrics.threatsDetected += 1;
          break;
        case 'incident_response':
          agent.metrics.incidentsResolved += 1;
          break;
        case 'vulnerability_analysis':
          if (!agent.metrics.vulnerabilitiesFound) agent.metrics.vulnerabilitiesFound = 0;
          agent.metrics.vulnerabilitiesFound += 1;
          break;
        case 'threat_intelligence':
          if (!agent.metrics.threatIntelUpdates) agent.metrics.threatIntelUpdates = 0;
          agent.metrics.threatIntelUpdates += 1;
          break;
        case 'defense_coordination':
          if (!agent.metrics.coordinationActions) agent.metrics.coordinationActions = 0;
          agent.metrics.coordinationActions += 1;
          break;
        case 'audit_compliance':
          if (!agent.metrics.complianceChecks) agent.metrics.complianceChecks = 0;
          agent.metrics.complianceChecks += 1;
          break;
        case 'recovery_resilience':
          if (!agent.metrics.backupsCompleted) agent.metrics.backupsCompleted = 0;
          agent.metrics.backupsCompleted += 1;
          break;
      }
    }

    console.log(`🚨 Alerta generada: ${alert.message} (${alert.severity})`);

    if (this.socketIO) {
      this.socketIO.emit('new-alert', alert);
    }
  }

  simulateAttackScenario() {
    const scenarios = [
      'Advanced Persistent Threat (APT) detected',
      'Distributed Denial of Service (DDoS) in progress',
      'Ransomware campaign identified',
      'Zero-day exploit attempt blocked',
      'Nation-state actor activity observed'
    ];

    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    const criticalAlert = {
      _id: 'demo-critical-' + Date.now(),
      type: 'CRITICAL',
      message: `🚨 SCENARIO: ${scenario}`,
      agentType: 'defense_coordination',
      severity: 'critical',
      status: 'open',
      createdAt: new Date(),
      details: {
        scenarioType: scenario,
        automated: true,
        confidence: 95,
        threatLevel: 'CRITICAL'
      }
    };

    this.alerts.push(criticalAlert);
    
    console.log(`🚨🚨 ESCENARIO CRÍTICO: ${scenario}`);

    if (this.socketIO) {
      this.socketIO.emit('critical-alert', criticalAlert);
      this.socketIO.emit('attack-scenario', {
        scenario,
        severity: 'critical'
      });
    }
  }

  generateRandomIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  getSimulationStats() {
    return {
      isRunning: this.isRunning,
      totalAgents: this.demoAgents.length,
      activeAgents: this.demoAgents.filter(a => a.status === 'active').length,
      recentAlerts: this.alerts.filter(a => {
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return new Date(a.createdAt) > hourAgo;
      }).length,
      criticalAlerts: this.alerts.filter(a => a.severity === 'critical').length,
      lastUpdate: new Date()
    };
  }

  getDemoAgents() {
    return this.demoAgents;
  }

  getDemoAlerts() {
    return this.alerts.slice(-20); // Últimas 20 alertas
  }
}

module.exports = new DemoSimulationService();

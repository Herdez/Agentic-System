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
        status: 'inactive', // Inicialmente inactivo
        metrics: { threatsDetected: 0, uptime: 0, responseTime: 0, incidentsResolved: 0 }
      },
      {
        _id: 'demo-002',
        name: 'Coordinador de Respuesta Beta',
        type: 'incident_response',
        status: 'inactive',
        metrics: { threatsDetected: 0, uptime: 0, responseTime: 0, incidentsResolved: 0 }
      },
      {
        _id: 'demo-003',
        name: 'Analizador de Vulnerabilidades Gamma',
        type: 'vulnerability_analysis',
        status: 'inactive',
        metrics: { threatsDetected: 0, uptime: 0, responseTime: 0, vulnerabilitiesFound: 0 }
      },
      {
        _id: 'demo-004',
        name: 'Intel de Amenazas Delta',
        type: 'threat_intelligence',
        status: 'inactive',
        metrics: { threatsDetected: 0, uptime: 0, responseTime: 0, threatIntelUpdates: 0 }
      },
      {
        _id: 'demo-005',
        name: 'Coordinador de Defensa Epsilon',
        type: 'defense_coordination',
        status: 'inactive',
        metrics: { threatsDetected: 0, uptime: 0, responseTime: 0, coordinationActions: 0 }
      },
      {
        _id: 'demo-006',
        name: 'Auditor de Cumplimiento Zeta',
        type: 'audit_compliance',
        status: 'inactive',
        metrics: { threatsDetected: 0, uptime: 0, responseTime: 0, complianceChecks: 0 }
      },
      {
        _id: 'demo-007',
        name: 'Especialista en Recuperación Eta',
        type: 'recovery_resilience',
        status: 'inactive',
        metrics: { threatsDetected: 0, uptime: 0, responseTime: 0, backupsCompleted: 0 }
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

    // Activar todos los agentes al iniciar
    this.demoAgents.forEach(agent => {
      agent.status = 'active';
      agent.metrics.uptime = Math.random() * 10 + 95; // 95-100%
      agent.metrics.responseTime = Math.random() * 0.5 + 0.2; // 0.2-0.7s
      console.log(`🤖 Agente ${agent.name} activado`);
    });

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

    // Emitir estado de inicio y agentes actualizados
    if (this.socketIO) {
      this.socketIO.emit('simulation-status', { running: true });
      this.socketIO.emit('demo-agents-update', this.demoAgents);
      console.log('📡 Estado de simulación y agentes enviado vía WebSocket');
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

    // Desactivar todos los agentes
    this.demoAgents.forEach(agent => {
      agent.status = 'inactive';
      agent.metrics.uptime = 0;
      agent.metrics.responseTime = 0;
      console.log(`🔴 Agente ${agent.name} desactivado`);
    });

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }

    if (this.attackInterval) {
      clearInterval(this.attackInterval);
      this.attackInterval = null;
    }

    // Emitir estado de parada y agentes actualizados
    if (this.socketIO) {
      this.socketIO.emit('simulation-status', { running: false });
      this.socketIO.emit('demo-agents-update', this.demoAgents);
      console.log('📡 Estado de parada y agentes enviado vía WebSocket');
    }

    return true;
  }

  runSimulationCycle() {
    try {
      console.log('🔄 Ejecutando ciclo de simulación...');
      
      // Simular actividad de agentes con estados más dinámicos y variados
      this.demoAgents.forEach((agent, index) => {
        if (agent.status === 'inactive') return; // Skip si está inactivo
        
        // Actualizar métricas más dinámicamente
        const uptimeDelta = (Math.random() - 0.5) * 5; // ±2.5%
        agent.metrics.uptime = Math.max(85, Math.min(100, agent.metrics.uptime + uptimeDelta));
        
        const responseDelta = (Math.random() - 0.5) * 0.3; // ±0.15s
        agent.metrics.responseTime = Math.max(0.1, Math.min(3.0, agent.metrics.responseTime + responseDelta));
        
        // Estados más dinámicos y específicos por tipo de agente
        const random = Math.random();
        let possibleStates = ['active'];
        
        // Estados específicos por tipo de agente
        switch (agent.type) {
          case 'intrusion_detection':
            possibleStates = ['active', 'investigando', 'escaneando', 'monitoreo'];
            break;
          case 'incident_response':
            possibleStates = ['active', 'respondiendo', 'investigando', 'monitoreo'];
            break;
          case 'vulnerability_analysis':
            possibleStates = ['active', 'escaneando', 'investigando', 'monitoreo'];
            break;
          case 'threat_intelligence':
            possibleStates = ['active', 'investigando', 'monitoreo', 'escaneando'];
            break;
          case 'defense_coordination':
            possibleStates = ['active', 'respondiendo', 'monitoreo', 'investigando'];
            break;
          case 'audit_compliance':
            possibleStates = ['active', 'escaneando', 'monitoreo', 'investigando'];
            break;
          case 'recovery_resilience':
            possibleStates = ['active', 'respondiendo', 'monitoreo', 'escaneando'];
            break;
        }
        
        // Lógica de cambio de estado basada en métricas y probabilidades
        if (agent.metrics.uptime < 90) {
          agent.status = random < 0.4 ? 'mantenimiento' : 'error';
        } else if (agent.metrics.responseTime > 1.8) {
          agent.status = possibleStates[Math.floor(Math.random() * possibleStates.length)];
        } else if (random < 0.3) { // 30% probabilidad de cambio dinámico
          agent.status = possibleStates[Math.floor(Math.random() * possibleStates.length)];
        } else if (random < 0.05) { // 5% probabilidad de mantenimiento
          agent.status = 'mantenimiento';
        }
        
        // Recuperación automática de errores y mantenimiento
        if ((agent.status === 'error' || agent.status === 'mantenimiento') && random < 0.6) {
          agent.status = possibleStates[0]; // Volver al estado principal
          agent.metrics.uptime = Math.min(100, agent.metrics.uptime + 5);
        }
        
        // Log de cambios significativos
        if (random < 0.1) { // 10% de logging para no spam
          console.log(`🤖 ${agent.name}: ${agent.status} (uptime: ${agent.metrics.uptime.toFixed(1)}%)`);
        }
      });

      // Generar alertas con más frecuencia y variedad
      if (Math.random() < 0.6) { // 60% probabilidad
        this.generateAlert();
      }

      // Resolver algunas alertas automáticamente (simulando respuesta de agentes)
      this.resolveAlerts();

      // Emitir actualizaciones
      if (this.socketIO) {
        this.socketIO.emit('demo-agents-update', this.demoAgents);
        this.socketIO.emit('demo-alerts-update', this.alerts.slice(-15));
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
      'System coordination improved',
      'Network anomaly detected',
      'Unauthorized access attempt',
      'DDoS attack mitigated',
      'Phishing email blocked'
    ];

    const severities = ['low', 'medium', 'high', 'critical'];
    const agentTypes = ['intrusion_detection', 'incident_response', 'vulnerability_analysis', 
                       'threat_intelligence', 'defense_coordination', 'audit_compliance', 
                       'recovery_resilience'];

    const selectedAgentType = agentTypes[Math.floor(Math.random() * agentTypes.length)];
    const selectedSeverity = severities[Math.floor(Math.random() * severities.length)];

    const alert = {
      _id: 'demo-alert-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      type: selectedSeverity === 'critical' ? 'CRITICAL' : 'WARNING',
      message: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      agentId: this.demoAgents.find(a => a.type === selectedAgentType)?._id || selectedAgentType,
      agentType: selectedAgentType,
      severity: selectedSeverity,
      status: 'open',
      timestamp: new Date().toISOString(),
      createdAt: new Date(),
      details: {
        automated: true,
        confidence: Math.round(Math.random() * 30 + 70),
        sourceIP: this.generateRandomIP(),
        timestamp: new Date(),
        description: `Alert generated by ${selectedAgentType.replace('_', ' ')} agent`
      }
    };

    this.alerts.push(alert);
    
    // Mantener solo las últimas 50 alertas
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }

    console.log(`🚨 Nueva alerta generada: ${alert.message} (${alert.severity})`);

    // Emitir alerta individual para notificaciones en tiempo real
    if (this.socketIO) {
      this.socketIO.emit('new-alert', alert);
    }
    
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

  resolveAlerts() {
    // Resolver alertas automáticamente para simular respuesta del sistema
    const openAlerts = this.alerts.filter(alert => alert.status === 'open');
    let resolvedCount = 0;
    
    openAlerts.forEach(alert => {
      const random = Math.random();
      
      // Probabilidades de resolución basadas en severidad
      let resolutionChance;
      switch (alert.severity) {
        case 'low': resolutionChance = 0.8; break;
        case 'medium': resolutionChance = 0.6; break;
        case 'high': resolutionChance = 0.4; break;
        case 'critical': resolutionChance = 0.2; break;
        default: resolutionChance = 0.5;
      }
      
      if (random < resolutionChance) {
        alert.status = 'resolved';
        alert.resolvedAt = new Date();
        resolvedCount++;
        
        // Incrementar métricas de resolución del agente responsable
        const responsibleAgent = this.demoAgents.find(a => a.type === alert.agentType);
        if (responsibleAgent) {
          responsibleAgent.metrics.incidentsResolved = (responsibleAgent.metrics.incidentsResolved || 0) + 1;
        }
        
        console.log(`✅ Alerta resuelta: ${alert.message} por ${alert.agentType}`);
      }
    });

    // Log de estadísticas de resolución
    if (resolvedCount > 0) {
      const remainingActive = this.alerts.filter(a => a.status !== 'resolved').length;
      console.log(`🔄 Resueltas ${resolvedCount} alertas. Alertas activas restantes: ${remainingActive}`);
    }

    // Remover alertas resueltas hace más de 5 minutos para mantener la lista limpia
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const beforeCleanup = this.alerts.length;
    this.alerts = this.alerts.filter(alert => {
      if (alert.status === 'resolved' && alert.resolvedAt) {
        return new Date(alert.resolvedAt) > fiveMinutesAgo;
      }
      return true;
    });
    
    const cleanedCount = beforeCleanup - this.alerts.length;
    if (cleanedCount > 0) {
      console.log(`🗑️ Limpiadas ${cleanedCount} alertas resueltas antiguas`);
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
    // Solo contar alertas activas (no resueltas)
    const activeAlerts = this.alerts.filter(a => a.status !== 'resolved');
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentActiveAlerts = activeAlerts.filter(a => {
      return new Date(a.createdAt) > hourAgo;
    });
    
    const stats = {
      isRunning: this.isRunning,
      totalAgents: this.demoAgents.length,
      activeAgents: this.demoAgents.filter(a => a.status !== 'inactive').length,
      recentAlerts: recentActiveAlerts.length,
      criticalAlerts: activeAlerts.filter(a => a.severity === 'critical').length,
      lastUpdate: new Date()
    };
    
    // Log periódico para debugging
    if (Math.random() < 0.1) { // 10% de las veces
      console.log('📊 Estadísticas actuales:', {
        totalAlertas: this.alerts.length,
        alertasActivas: activeAlerts.length,
        alertasRecientes: stats.recentAlerts,
        alertasCriticas: stats.criticalAlerts,
        agentesActivos: stats.activeAgents
      });
    }
    
    return stats;
  }

  getDemoAgents() {
    return this.demoAgents;
  }

  getDemoAlerts() {
    // Retornar solo alertas activas (no resueltas) para el dashboard
    return this.alerts.filter(alert => alert.status !== 'resolved').slice(-20);
  }
}

module.exports = new DemoSimulationService();

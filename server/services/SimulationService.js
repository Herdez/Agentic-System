const Agent = require('../models/Agent');
const Alert = require('../models/Alert');
const io = require('socket.io');

class SimulationService {
  constructor() {
    this.simulationInterval = null;
    this.isRunning = false;
    this.scenarios = [];
    this.attackSimulations = [];
    this.socketIO = null;
  }

  // Configurar Socket.IO
  setSocketIO(socketInstance) {
    this.socketIO = socketInstance;
  }

  // Iniciar simulación continua
  startSimulation() {
    if (this.isRunning) {
      console.log('⚠️ Simulación ya está ejecutándose');
      return;
    }

    console.log('🎮 Iniciando simulación de agentes...');
    this.isRunning = true;

    // Simular actividad cada 5 segundos
    this.simulationInterval = setInterval(async () => {
      await this.runSimulationCycle();
    }, 5000);

    // Simular ataques ocasionales cada 30 segundos
    setInterval(async () => {
      if (Math.random() < 0.7) { // 70% probabilidad de ataque
        await this.simulateAttackScenario();
      }
    }, 30000);

    // Simular eventos de red cada 10 segundos
    setInterval(async () => {
      await this.simulateNetworkEvents();
    }, 10000);
  }

  // Detener simulación
  stopSimulation() {
    if (!this.isRunning) {
      console.log('⚠️ Simulación no está ejecutándose');
      return;
    }

    console.log('⏹️ Deteniendo simulación de agentes...');
    this.isRunning = false;

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  // Ejecutar un ciclo de simulación
  async runSimulationCycle() {
    try {
      const agents = await Agent.find({ status: 'active' });
      
      for (const agent of agents) {
        await this.simulateAgentBehavior(agent);
      }

      // Emitir actualizaciones en tiempo real
      if (this.socketIO) {
        const stats = await this.getSimulationStats();
        this.socketIO.emit('simulation_update', stats);
      }

    } catch (error) {
      console.error('❌ Error en ciclo de simulación:', error);
    }
  }

  // Simular comportamiento específico de cada agente
  async simulateAgentBehavior(agent) {
    try {
      switch (agent.type) {
        case 'intrusion_detection':
          await this.simulateIntrusionDetection(agent);
          break;
        case 'incident_response':
          await this.simulateIncidentResponse(agent);
          break;
        case 'vulnerability_analysis':
          await this.simulateVulnerabilityAnalysis(agent);
          break;
        case 'threat_intelligence':
          await this.simulateThreatIntelligence(agent);
          break;
        case 'defense_coordination':
          await this.simulateDefenseCoordination(agent);
          break;
        case 'audit_compliance':
          await this.simulateAuditCompliance(agent);
          break;
        case 'recovery_resilience':
          await this.simulateRecoveryResilience(agent);
          break;
      }

      // Actualizar métricas generales
      agent.metrics.uptime = Math.max(95, Math.min(100, agent.metrics.uptime + (Math.random() - 0.5) * 2));
      agent.metrics.responseTime = Math.max(0.1, Math.min(2.0, agent.metrics.responseTime + (Math.random() - 0.5) * 0.2));
      agent.lastActivity = new Date();
      
      await agent.save();

    } catch (error) {
      console.error(`❌ Error simulando agente ${agent.name}:`, error);
    }
  }

  // Simular detección de intrusiones
  async simulateIntrusionDetection(agent) {
    if (Math.random() < 0.3) { // 30% probabilidad de detección
      const intrusionTypes = [
        'Brute force attack on admin panel',
        'SQL injection attempt detected',
        'Cross-site scripting (XSS) pattern found',
        'Unauthorized API access attempt',
        'Suspicious file upload behavior',
        'Port scanning activity detected',
        'DDoS pattern identified'
      ];

      const intrusion = intrusionTypes[Math.floor(Math.random() * intrusionTypes.length)];
      const severity = Math.random() < 0.15 ? 'critical' : Math.random() < 0.35 ? 'high' : 'medium';

      agent.metrics.threatsDetected += 1;

      await Alert.create({
        type: severity === 'critical' ? 'CRITICAL' : 'WARNING',
        message: `🚨 ${agent.name}: ${intrusion}`,
        agentId: agent._id,
        agentType: agent.type,
        severity,
        category: 'intrusion_detection',
        details: {
          detectionMethod: 'pattern_analysis',
          confidence: Math.round(Math.random() * 25 + 75),
          sourceIP: this.generateRandomIP(),
          targetEndpoint: this.generateRandomEndpoint(),
          timestamp: new Date()
        }
      });

      console.log(`🔍 ${agent.name} detectó: ${intrusion}`);
    }
  }

  // Simular respuesta a incidentes
  async simulateIncidentResponse(agent) {
    const openAlerts = await Alert.find({ status: 'open', severity: { $in: ['critical', 'high'] } }).limit(5);
    
    if (openAlerts.length > 0 && Math.random() < 0.6) {
      const alert = openAlerts[Math.floor(Math.random() * openAlerts.length)];
      
      const responseActions = [
        'Isolated affected system',
        'Blocked malicious IP address',
        'Updated firewall rules',
        'Quarantined suspicious files',
        'Escalated to security team',
        'Initiated backup procedure'
      ];

      const action = responseActions[Math.floor(Math.random() * responseActions.length)];
      
      // Actualizar alerta
      alert.status = 'in_progress';
      alert.resolvedAt = null;
      alert.details.responseAction = action;
      alert.details.respondedBy = agent.name;
      await alert.save();

      await Alert.create({
        type: 'INFO',
        message: `✅ ${agent.name}: ${action} for incident ${alert._id.toString().slice(-6)}`,
        agentId: agent._id,
        agentType: agent.type,
        severity: 'low',
        category: 'incident_response',
        details: {
          originalIncident: alert._id,
          responseAction: action,
          timestamp: new Date()
        }
      });

      agent.metrics.incidentsResolved += 1;
      console.log(`🚑 ${agent.name} respondió: ${action}`);
    }
  }

  // Simular análisis de vulnerabilidades
  async simulateVulnerabilityAnalysis(agent) {
    if (Math.random() < 0.25) { // 25% probabilidad de encontrar vulnerabilidad
      const vulnerabilities = [
        'Outdated SSL certificate detected',
        'Weak password policy in user accounts',
        'Unpatched security vulnerability in dependency',
        'Insecure API endpoint configuration',
        'Missing security headers in web server',
        'Exposed database credentials in config',
        'Insufficient access controls detected'
      ];

      const vulnerability = vulnerabilities[Math.floor(Math.random() * vulnerabilities.length)];
      const cvssScore = (Math.random() * 6 + 4).toFixed(1); // Score 4.0-10.0

      agent.metrics.vulnerabilitiesFound += 1;

      await Alert.create({
        type: 'WARNING',
        message: `🔍 ${agent.name}: ${vulnerability}`,
        agentId: agent._id,
        agentType: agent.type,
        severity: cvssScore > 7.0 ? 'high' : cvssScore > 4.0 ? 'medium' : 'low',
        category: 'vulnerability_assessment',
        details: {
          cvssScore: parseFloat(cvssScore),
          scanMethod: 'automated_scan',
          affectedComponent: this.generateRandomComponent(),
          recommendations: this.generateSecurityRecommendations(),
          timestamp: new Date()
        }
      });

      console.log(`🔧 ${agent.name} encontró vulnerabilidad: ${vulnerability} (CVSS: ${cvssScore})`);
    }
  }

  // Simular inteligencia de amenazas
  async simulateThreatIntelligence(agent) {
    if (Math.random() < 0.2) { // 20% probabilidad de nueva amenaza
      const threatTypes = [
        'New malware signature detected',
        'Emerging phishing campaign identified',
        'Zero-day exploit in the wild',
        'Ransomware group targeting industry',
        'Nation-state APT activity observed',
        'Cryptocurrency mining malware trend',
        'Supply chain attack vector discovered'
      ];

      const threat = threatTypes[Math.floor(Math.random() * threatTypes.length)];
      const confidence = Math.round(Math.random() * 30 + 70); // 70-100%

      agent.metrics.threatIntelUpdates += 1;

      await Alert.create({
        type: 'INFO',
        message: `🌐 ${agent.name}: ${threat}`,
        agentId: agent._id,
        agentType: agent.type,
        severity: confidence > 90 ? 'high' : 'medium',
        category: 'threat_intelligence',
        details: {
          threatSource: this.generateThreatSource(),
          confidence,
          iocCount: Math.floor(Math.random() * 50) + 10,
          firstSeen: new Date(),
          timestamp: new Date()
        }
      });

      console.log(`🌍 ${agent.name} actualizó intel: ${threat} (${confidence}% confianza)`);
    }
  }

  // Simular coordinación de defensa
  async simulateDefenseCoordination(agent) {
    if (Math.random() < 0.4) { // 40% probabilidad de coordinación
      const actions = [
        'Synchronized defense posture across all nodes',
        'Allocated additional resources to high-risk areas',
        'Coordinated response to multi-vector attack',
        'Updated global security policies',
        'Orchestrated cross-agent threat sharing',
        'Initiated network-wide security sweep'
      ];

      const action = actions[Math.floor(Math.random() * actions.length)];
      agent.metrics.coordinationActions += 1;

      await Alert.create({
        type: 'INFO',
        message: `🎯 ${agent.name}: ${action}`,
        agentId: agent._id,
        agentType: agent.type,
        severity: 'low',
        category: 'defense_coordination',
        details: {
          scope: 'global',
          affectedAgents: Math.floor(Math.random() * 6) + 2,
          coordinationLevel: Math.round(Math.random() * 30 + 70),
          timestamp: new Date()
        }
      });

      console.log(`🎯 ${agent.name} coordinó: ${action}`);
    }
  }

  // Simular auditoría y cumplimiento
  async simulateAuditCompliance(agent) {
    if (Math.random() < 0.15) { // 15% probabilidad de hallazgo de auditoría
      const findings = [
        'Compliance violation in data retention policy',
        'Missing audit log for privileged access',
        'Non-compliant encryption standards detected',
        'Incomplete security training records found',
        'Unauthorized software installation identified',
        'Policy exception requires documentation'
      ];

      const finding = findings[Math.floor(Math.random() * findings.length)];
      agent.metrics.complianceChecks += 1;

      await Alert.create({
        type: 'WARNING',
        message: `📋 ${agent.name}: ${finding}`,
        agentId: agent._id,
        agentType: agent.type,
        severity: 'medium',
        category: 'compliance_audit',
        details: {
          regulation: this.generateRegulation(),
          riskLevel: Math.random() < 0.3 ? 'high' : 'medium',
          remediation: 'Administrative action required',
          timestamp: new Date()
        }
      });

      console.log(`📋 ${agent.name} encontró: ${finding}`);
    }
  }

  // Simular recuperación y resiliencia
  async simulateRecoveryResilience(agent) {
    if (Math.random() < 0.1) { // 10% probabilidad de actividad de recuperación
      const activities = [
        'Backup integrity verification completed',
        'Disaster recovery plan updated',
        'System redundancy check performed',
        'Data replication synchronized',
        'Recovery time objective validated',
        'Business continuity test executed'
      ];

      const activity = activities[Math.floor(Math.random() * activities.length)];
      agent.metrics.backupsCompleted += 1;

      await Alert.create({
        type: 'INFO',
        message: `💾 ${agent.name}: ${activity}`,
        agentId: agent._id,
        agentType: agent.type,
        severity: 'low',
        category: 'recovery_resilience',
        details: {
          backupSize: `${(Math.random() * 500 + 100).toFixed(1)}GB`,
          integrityScore: Math.round(Math.random() * 5 + 95),
          rtoMet: Math.random() < 0.95,
          timestamp: new Date()
        }
      });

      console.log(`💾 ${agent.name} completó: ${activity}`);
    }
  }

  // Simular escenario de ataque complejo
  async simulateAttackScenario() {
    const scenarios = [
      {
        name: 'Advanced Persistent Threat (APT)',
        stages: [
          'Initial reconnaissance phase detected',
          'Lateral movement attempt identified',
          'Privilege escalation in progress',
          'Data exfiltration attempt blocked'
        ],
        severity: 'critical'
      },
      {
        name: 'Distributed Denial of Service (DDoS)',
        stages: [
          'Traffic anomaly detected',
          'Bot network identified',
          'Service degradation observed',
          'Mitigation measures activated'
        ],
        severity: 'high'
      },
      {
        name: 'Ransomware Campaign',
        stages: [
          'Suspicious file encryption activity',
          'Ransom note deployment detected',
          'Network share access blocked',
          'Backup systems secured'
        ],
        severity: 'critical'
      }
    ];

    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    console.log(`🚨 Simulando escenario de ataque: ${scenario.name}`);

    // Simular cada etapa del ataque con retrasos realistas
    for (let i = 0; i < scenario.stages.length; i++) {
      setTimeout(async () => {
        const agents = await Agent.find({ status: 'active' });
        const randomAgent = agents[Math.floor(Math.random() * agents.length)];

        await Alert.create({
          type: scenario.severity === 'critical' ? 'CRITICAL' : 'WARNING',
          message: `🚨 SCENARIO ${scenario.name.toUpperCase()}: ${scenario.stages[i]}`,
          agentId: randomAgent._id,
          agentType: randomAgent.type,
          severity: scenario.severity,
          category: 'attack_scenario',
          details: {
            scenarioName: scenario.name,
            stage: i + 1,
            totalStages: scenario.stages.length,
            attackVector: this.generateAttackVector(),
            timestamp: new Date()
          }
        });

        if (this.socketIO) {
          this.socketIO.emit('attack_scenario', {
            scenario: scenario.name,
            stage: scenario.stages[i],
            severity: scenario.severity
          });
        }
      }, i * 8000); // 8 segundos entre cada etapa
    }
  }

  // Simular eventos de red
  async simulateNetworkEvents() {
    if (Math.random() < 0.3) { // 30% probabilidad
      const events = [
        'Network latency spike detected',
        'Node synchronization completed',
        'Blockchain fork resolved',
        'Transaction throughput optimized',
        'Peer connection established',
        'Consensus mechanism updated'
      ];

      const event = events[Math.floor(Math.random() * events.length)];
      
      if (this.socketIO) {
        this.socketIO.emit('network_event', {
          event,
          timestamp: new Date(),
          metrics: {
            tps: Math.floor(Math.random() * 500) + 1000,
            blockHeight: Math.floor(Math.random() * 1000) + 850000,
            peers: Math.floor(Math.random() * 10) + 45
          }
        });
      }
    }
  }

  // Métodos auxiliares para generar datos realistas
  generateRandomIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  generateRandomEndpoint() {
    const endpoints = ['/api/auth', '/api/users', '/api/admin', '/api/payments', '/api/data'];
    return endpoints[Math.floor(Math.random() * endpoints.length)];
  }

  generateRandomComponent() {
    const components = ['Web Server', 'Database', 'API Gateway', 'Load Balancer', 'File System'];
    return components[Math.floor(Math.random() * components.length)];
  }

  generateSecurityRecommendations() {
    const recommendations = [
      'Update to latest security patch',
      'Implement stronger authentication',
      'Configure proper access controls',
      'Enable security monitoring',
      'Update security policies'
    ];
    return recommendations[Math.floor(Math.random() * recommendations.length)];
  }

  generateThreatSource() {
    const sources = ['OSINT Feeds', 'Vendor Reports', 'Government Alerts', 'Industry Sharing', 'Internal Research'];
    return sources[Math.floor(Math.random() * sources.length)];
  }

  generateRegulation() {
    const regulations = ['GDPR', 'SOX', 'HIPAA', 'PCI-DSS', 'ISO 27001'];
    return regulations[Math.floor(Math.random() * regulations.length)];
  }

  generateAttackVector() {
    const vectors = ['Email Phishing', 'Web Exploitation', 'Network Intrusion', 'Social Engineering', 'Supply Chain'];
    return vectors[Math.floor(Math.random() * vectors.length)];
  }

  // Obtener estadísticas de simulación
  async getSimulationStats() {
    try {
      const agents = await Agent.find();
      const recentAlerts = await Alert.find({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      return {
        isRunning: this.isRunning,
        totalAgents: agents.length,
        activeAgents: agents.filter(a => a.status === 'active').length,
        recentAlerts: recentAlerts.length,
        criticalAlerts: recentAlerts.filter(a => a.severity === 'critical').length,
        lastUpdate: new Date()
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de simulación:', error);
      return null;
    }
  }
}

module.exports = new SimulationService();

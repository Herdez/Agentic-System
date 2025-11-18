const Agent = require('../models/Agent');
const Alert = require('../models/Alert');

class AgentService {
  
  // Inicializar agentes por defecto
  static async initializeDefaultAgents() {
    try {
      const existingAgents = await Agent.countDocuments();
      
      if (existingAgents === 0) {
        const defaultAgents = [
          {
            name: 'Detector de Intrusos Alpha',
            type: 'intrusion_detection',
            description: 'Agente especializado en detectar patrones de intrusión y actividad sospechosa en la red blockchain',
            capabilities: ['pattern_analysis', 'anomaly_detection', 'real_time_monitoring'],
            networkLocation: { region: 'US-EAST', node: 'NODE-001', coordinates: { lat: 40.7128, lng: -74.0060 } }
          },
          {
            name: 'Coordinador de Respuesta Beta',
            type: 'incident_response',
            description: 'Agente que coordina la respuesta automática ante incidentes de seguridad detectados',
            capabilities: ['incident_coordination', 'automatic_response', 'escalation_management'],
            networkLocation: { region: 'EU-WEST', node: 'NODE-002', coordinates: { lat: 51.5074, lng: -0.1278 } }
          },
          {
            name: 'Analizador de Vulnerabilidades Gamma',
            type: 'vulnerability_analysis',
            description: 'Agente que analiza código, configuraciones y busca vulnerabilidades conocidas',
            capabilities: ['code_analysis', 'vulnerability_scanning', 'security_assessment'],
            networkLocation: { region: 'ASIA-EAST', node: 'NODE-003', coordinates: { lat: 35.6762, lng: 139.6503 } }
          },
          {
            name: 'Intel de Amenazas Delta',
            type: 'threat_intelligence',
            description: 'Agente que recopila y analiza inteligencia de amenazas externas',
            capabilities: ['threat_feeds', 'osint_collection', 'threat_correlation'],
            networkLocation: { region: 'US-WEST', node: 'NODE-004', coordinates: { lat: 37.7749, lng: -122.4194 } }
          },
          {
            name: 'Coordinador de Defensa Epsilon',
            type: 'defense_coordination',
            description: 'Agente maestro que coordina las acciones defensivas de todos los agentes',
            capabilities: ['agent_coordination', 'strategy_planning', 'resource_allocation'],
            networkLocation: { region: 'EU-CENTRAL', node: 'NODE-005', coordinates: { lat: 52.5200, lng: 13.4050 } }
          },
          {
            name: 'Auditor de Cumplimiento Zeta',
            type: 'audit_compliance',
            description: 'Agente que verifica el cumplimiento de políticas y regulaciones de seguridad',
            capabilities: ['policy_enforcement', 'compliance_checking', 'audit_logging'],
            networkLocation: { region: 'CANADA-CENTRAL', node: 'NODE-006', coordinates: { lat: 43.6532, lng: -79.3832 } }
          },
          {
            name: 'Especialista en Recuperación Eta',
            type: 'recovery_resilience',
            description: 'Agente encargado de garantizar la recuperación y resiliencia del sistema',
            capabilities: ['backup_management', 'disaster_recovery', 'system_restoration'],
            networkLocation: { region: 'AUSTRALIA-EAST', node: 'NODE-007', coordinates: { lat: -33.8688, lng: 151.2093 } }
          }
        ];

        await Agent.insertMany(defaultAgents);
        console.log('✅ Agentes por defecto inicializados');
        return defaultAgents;
      }
      
      return await Agent.find();
    } catch (error) {
      console.error('❌ Error inicializando agentes:', error);
      throw error;
    }
  }

  // Obtener todos los agentes
  static async getAllAgents() {
    try {
      return await Agent.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error obteniendo agentes:', error);
      throw error;
    }
  }

  // Obtener agente por ID
  static async getAgentById(id) {
    try {
      const agent = await Agent.findById(id);
      if (!agent) {
        throw new Error('Agente no encontrado');
      }
      return agent;
    } catch (error) {
      console.error('Error obteniendo agente:', error);
      throw error;
    }
  }

  // Ejecutar acción en agente
  static async executeAgentAction(agentId, action) {
    try {
      const agent = await Agent.findById(agentId);
      if (!agent) {
        throw new Error('Agente no encontrado');
      }

      await agent.executeAction(action);
      
      // Crear alerta de acción ejecutada
      await Alert.create({
        type: 'INFO',
        message: `Acción "${action}" ejecutada en agente ${agent.name}`,
        agentId: agent._id,
        agentType: agent.type,
        severity: 'low',
        category: 'system_update',
        details: {
          action,
          executedAt: new Date(),
          agentName: agent.name
        }
      });

      return agent;
    } catch (error) {
      console.error('Error ejecutando acción:', error);
      throw error;
    }
  }

  // Actualizar métricas de agente
  static async updateAgentMetrics(agentId, metrics) {
    try {
      const agent = await Agent.findById(agentId);
      if (!agent) {
        throw new Error('Agente no encontrado');
      }

      Object.keys(metrics).forEach(key => {
        if (agent.metrics[key] !== undefined) {
          agent.metrics[key] = metrics[key];
        }
      });

      agent.lastActivity = new Date();
      await agent.save();

      return agent;
    } catch (error) {
      console.error('Error actualizando métricas:', error);
      throw error;
    }
  }

  // Obtener estadísticas del sistema
  static async getSystemStats() {
    try {
      const agentOverview = await Agent.getSystemOverview();
      const alertStats = await Alert.getAlertStatistics();
      
      const networkStats = {
        nodesActive: Math.floor(Math.random() * 10) + 45,
        transactionsPerSecond: Math.floor(Math.random() * 500) + 1000,
        blockHeight: Math.floor(Math.random() * 1000) + 850000,
        hashRate: Math.floor(Math.random() * 50) + 150,
        networkLatency: Math.round((Math.random() * 0.5 + 0.1) * 100) / 100,
        uptime: 99.97,
        threatLevel: this.calculateThreatLevel(alertStats)
      };

      return {
        agents: agentOverview,
        alerts: alertStats,
        network: networkStats,
        lastUpdate: new Date()
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  // Calcular nivel de amenaza basado en alertas
  static calculateThreatLevel(alertStats) {
    const { critical, high, open } = alertStats;
    
    if (critical > 5 || high > 10) return 'CRITICAL';
    if (critical > 2 || high > 5) return 'HIGH';
    if (critical > 0 || high > 2) return 'MEDIUM';
    if (open > 10) return 'LOW';
    
    return 'MINIMAL';
  }

  // Simular actividad de agentes
  static async simulateAgentActivity() {
    try {
      const agents = await Agent.find({ status: 'active' });
      
      for (const agent of agents) {
        // Simular detección de amenazas ocasionalmente
        if (Math.random() < 0.2) { // 20% probabilidad
          agent.metrics.threatsDetected += 1;
          
          const threatTypes = [
            'Suspicious transaction pattern detected',
            'Anomalous network activity identified',
            'Potential vulnerability discovered',
            'Unauthorized access attempt blocked',
            'Malicious contract interaction prevented'
          ];
          
          const randomThreat = threatTypes[Math.floor(Math.random() * threatTypes.length)];
          
          await Alert.create({
            type: Math.random() < 0.1 ? 'CRITICAL' : 'WARNING',
            message: `${agent.name}: ${randomThreat}`,
            agentId: agent._id,
            agentType: agent.type,
            severity: Math.random() < 0.1 ? 'critical' : Math.random() < 0.3 ? 'high' : 'medium',
            details: {
              detectionMethod: 'automated_analysis',
              confidence: Math.round(Math.random() * 30 + 70), // 70-100%
              timestamp: new Date()
            }
          });
        }

        // Actualizar métricas
        agent.metrics.uptime = Math.max(95, Math.random() * 5 + 95);
        agent.metrics.responseTime = Math.round((Math.random() * 0.8 + 0.2) * 100) / 100;
        agent.lastActivity = new Date();
        
        await agent.save();
      }
      
      return true;
    } catch (error) {
      console.error('Error simulando actividad:', error);
      throw error;
    }
  }

  // Obtener agentes por tipo
  static async getAgentsByType(type) {
    try {
      return await Agent.find({ type });
    } catch (error) {
      console.error('Error obteniendo agentes por tipo:', error);
      throw error;
    }
  }

  // Crear nuevo agente
  static async createAgent(agentData) {
    try {
      const agent = new Agent(agentData);
      await agent.save();
      
      await Alert.create({
        type: 'INFO',
        message: `Nuevo agente "${agent.name}" agregado al sistema`,
        agentId: agent._id,
        agentType: agent.type,
        severity: 'low',
        category: 'system_update'
      });

      return agent;
    } catch (error) {
      console.error('Error creando agente:', error);
      throw error;
    }
  }
}

module.exports = AgentService;

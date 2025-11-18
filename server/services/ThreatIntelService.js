class ThreatIntelService {
  
  // Datos simulados de inteligencia de amenazas
  static threatIntelData = [
    {
      id: 'threat-001',
      name: 'APT-29 Cozy Bear',
      type: 'Advanced Persistent Threat',
      severity: 'critical',
      description: 'Grupo de amenaza persistente avanzada conocido por ataques a infraestructuras críticas',
      indicators: ['192.168.1.100', 'malicious-domain.com', 'SHA256:abc123...'],
      lastSeen: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      confidence: 95,
      source: 'threat_intelligence_feed'
    },
    {
      id: 'threat-002',
      name: 'Lazarus Group',
      type: 'Nation State Actor',
      severity: 'high',
      description: 'Grupo de amenaza asociado con ataques a instituciones financieras y exchanges de criptomonedas',
      indicators: ['10.0.0.50', 'crypto-stealer.exe', 'SHA256:def456...'],
      lastSeen: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      confidence: 88,
      source: 'osint_collection'
    },
    {
      id: 'threat-003',
      name: 'DarkHalo Campaign',
      type: 'Malware Campaign',
      severity: 'medium',
      description: 'Campaña de malware dirigida a redes blockchain y carteras digitales',
      indicators: ['evil-wallet-stealer.js', '172.16.0.25', 'SHA256:ghi789...'],
      lastSeen: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      confidence: 72,
      source: 'automated_analysis'
    }
  ];

  // Obtener todas las amenazas
  static getAllThreats(filters = {}) {
    try {
      let filteredThreats = [...this.threatIntelData];
      
      if (filters.severity) {
        filteredThreats = filteredThreats.filter(threat => threat.severity === filters.severity);
      }
      
      if (filters.source) {
        filteredThreats = filteredThreats.filter(threat => threat.source === filters.source);
      }
      
      if (filters.limit) {
        filteredThreats = filteredThreats.slice(0, parseInt(filters.limit));
      }
      
      return filteredThreats;
    } catch (error) {
      console.error('Error obteniendo amenazas:', error);
      throw error;
    }
  }

  // Obtener amenaza por ID
  static getThreatById(id) {
    try {
      const threat = this.threatIntelData.find(t => t.id === id);
      if (!threat) {
        throw new Error('Amenaza no encontrada');
      }
      return threat;
    } catch (error) {
      console.error('Error obteniendo amenaza por ID:', error);
      throw error;
    }
  }

  // Buscar amenazas por indicadores
  static searchThreats(searchCriteria) {
    try {
      const { indicators = [], threatType, minConfidence = 0 } = searchCriteria;
      
      const matchingThreats = this.threatIntelData.filter(threat => {
        const indicatorMatch = indicators.length === 0 || 
          indicators.some(indicator => 
            threat.indicators.some(ti => ti.toLowerCase().includes(indicator.toLowerCase()))
          );
        
        const typeMatch = !threatType || threat.type.toLowerCase().includes(threatType.toLowerCase());
        const confidenceMatch = threat.confidence >= minConfidence;
        
        return indicatorMatch && typeMatch && confidenceMatch;
      });
      
      return matchingThreats;
    } catch (error) {
      console.error('Error buscando amenazas:', error);
      throw error;
    }
  }

  // Obtener estadísticas de amenazas
  static getThreatStatistics() {
    try {
      const stats = {
        total: this.threatIntelData.length,
        critical: this.threatIntelData.filter(t => t.severity === 'critical').length,
        high: this.threatIntelData.filter(t => t.severity === 'high').length,
        medium: this.threatIntelData.filter(t => t.severity === 'medium').length,
        low: this.threatIntelData.filter(t => t.severity === 'low').length,
        averageConfidence: Math.round(
          this.threatIntelData.reduce((sum, t) => sum + t.confidence, 0) / this.threatIntelData.length
        ),
        sources: [...new Set(this.threatIntelData.map(t => t.source))],
        recentThreats: this.threatIntelData
          .filter(t => t.lastSeen > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .length
      };
      
      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas de amenazas:', error);
      throw error;
    }
  }

  // Agregar nueva amenaza
  static addThreat(threatData) {
    try {
      const newThreat = {
        id: `threat-${Date.now()}`,
        lastSeen: new Date(),
        confidence: 50,
        source: 'user_reported',
        ...threatData
      };
      
      this.threatIntelData.push(newThreat);
      console.log(`🕵️ Nueva amenaza agregada: ${newThreat.name}`);
      return newThreat;
    } catch (error) {
      console.error('Error agregando amenaza:', error);
      throw error;
    }
  }

  // Actualizar nivel de confianza
  static updateThreatConfidence(threatId, confidence) {
    try {
      if (confidence < 0 || confidence > 100) {
        throw new Error('La confianza debe estar entre 0 y 100');
      }
      
      const threatIndex = this.threatIntelData.findIndex(t => t.id === threatId);
      
      if (threatIndex === -1) {
        throw new Error('Amenaza no encontrada');
      }
      
      this.threatIntelData[threatIndex].confidence = confidence;
      
      console.log(`🕵️ Confianza actualizada para amenaza ${threatId}: ${confidence}%`);
      return this.threatIntelData[threatIndex];
    } catch (error) {
      console.error('Error actualizando confianza:', error);
      throw error;
    }
  }

  // Obtener feeds activos de amenazas
  static getActiveFeeds() {
    try {
      const activeFeeds = [
        {
          name: 'MITRE ATT&CK',
          status: 'active',
          lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000),
          threatCount: 156,
          url: 'https://attack.mitre.org/'
        },
        {
          name: 'CISA Threat Feed',
          status: 'active',
          lastUpdate: new Date(Date.now() - 30 * 60 * 1000),
          threatCount: 89,
          url: 'https://cisa.gov/cybersecurity'
        },
        {
          name: 'AlienVault OTX',
          status: 'maintenance',
          lastUpdate: new Date(Date.now() - 6 * 60 * 60 * 1000),
          threatCount: 234,
          url: 'https://otx.alienvault.com/'
        }
      ];
      
      return activeFeeds;
    } catch (error) {
      console.error('Error obteniendo feeds activos:', error);
      throw error;
    }
  }

  // Simular nuevas amenazas
  static simulateNewThreats() {
    try {
      const threatTemplates = [
        {
          name: 'Crypto Mining Botnet',
          type: 'Botnet',
          severity: 'medium',
          description: 'Red de bots dedicada a minería de criptomonedas no autorizada',
          source: 'automated_detection'
        },
        {
          name: 'Smart Contract Exploit',
          type: 'Exploit Kit',
          severity: 'high',
          description: 'Explotación de vulnerabilidades en contratos inteligentes',
          source: 'smart_contract_analysis'
        },
        {
          name: 'DeFi Flash Loan Attack',
          type: 'Financial Attack',
          severity: 'critical',
          description: 'Ataque de préstamos flash en protocolo DeFi',
          source: 'defi_monitoring'
        }
      ];

      if (Math.random() < 0.3) { // 30% probabilidad
        const template = threatTemplates[Math.floor(Math.random() * threatTemplates.length)];
        
        const newThreat = {
          ...template,
          id: `threat-sim-${Date.now()}`,
          lastSeen: new Date(),
          confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
          indicators: [
            `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            `malicious-${Date.now()}.com`,
            `SHA256:${Math.random().toString(36).substr(2, 64)}`
          ]
        };

        this.threatIntelData.unshift(newThreat); // Agregar al inicio
        
        // Mantener solo las últimas 20 amenazas simuladas
        if (this.threatIntelData.length > 20) {
          this.threatIntelData = this.threatIntelData.slice(0, 20);
        }

        console.log(`🕵️ Nueva amenaza simulada: ${newThreat.name}`);
        return newThreat;
      }

      return null;
    } catch (error) {
      console.error('Error simulando amenazas:', error);
      throw error;
    }
  }

  // Correlacionar amenazas con alertas
  static correlateThreatWithAlert(alertData) {
    try {
      const { source, message, details } = alertData;
      
      // Buscar amenazas relacionadas basándose en indicadores
      const relatedThreats = this.threatIntelData.filter(threat => {
        if (details && details.ipAddress) {
          return threat.indicators.some(indicator => 
            indicator.includes(details.ipAddress)
          );
        }
        
        if (message) {
          return threat.indicators.some(indicator =>
            message.toLowerCase().includes(indicator.toLowerCase())
          );
        }
        
        return false;
      });

      if (relatedThreats.length > 0) {
        console.log(`🔗 Correlación encontrada: ${relatedThreats.length} amenazas relacionadas`);
        return relatedThreats;
      }

      return [];
    } catch (error) {
      console.error('Error correlacionando amenazas:', error);
      return [];
    }
  }
}

module.exports = ThreatIntelService;

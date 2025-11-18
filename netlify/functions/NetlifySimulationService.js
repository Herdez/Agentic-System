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
    const secondsSeed = Math.floor(now / 5000); // Cambia cada 5 segundos
    
    return this.agentTypes.map((agent, index) => {
      // Usar timestamp para generar datos "aleatorios" pero consistentes
      const seed = secondsSeed + index * 1000;
      const activityLevel = Math.sin(seed / 100) * 50 + 50; // 0-100
      
      // Amenazas detectadas más dinámicas (cambian cada 5 segundos)
      const baseThreats = Math.floor(Math.sin(seed / 30) * 15 + 20); // 5-35
      const recentThreats = Math.floor(Math.sin(seed / 10) * 5 + 2); // 0-7 amenazas nuevas
      const threatsDetected = baseThreats + recentThreats;
      
      // Acciones ejecutadas dinámicas
      const baseActions = Math.floor(Math.sin(seed / 40) * 50 + 80); // 30-130
      const recentActions = Math.floor(Math.sin(seed / 8) * 10 + 5); // 0-15 acciones nuevas
      const actionsExecuted = baseActions + recentActions;
      
      const lastActivity = new Date(now - (Math.abs(Math.sin(seed)) * 300000)); // Últimos 5 minutos

      // Estados dinámicos de agentes - preferir "active" al inicio
      const statusOptions = ['active', 'investigating', 'responding', 'scanning', 'monitoring'];
      const statusIndex = Math.abs(Math.floor(Math.sin(seed * 1.1) * statusOptions.length));
      // Hacer que al menos 5 de 7 agentes estén activos al inicio, luego rotar
      const currentStatus = (index < 5 && secondsSeed < 12) ? 'active' : statusOptions[statusIndex];
      
      // Actividades dinámicas más específicas según estado
      const activitiesByStatus = {
        'active': [
          'Monitoring network traffic in real-time',
          'Scanning for new vulnerabilities',
          'Processing incoming security alerts',
          'Analyzing threat patterns',
          'Coordinating with security team'
        ],
        'investigating': [
          'Investigating suspicious network activity',
          'Analyzing malware signatures',
          'Tracking threat actor movements',
          'Deep-diving into security incidents',
          'Correlating threat intelligence data'
        ],
        'responding': [
          'Blocking malicious IP addresses',
          'Isolating compromised systems',
          'Executing incident response protocols',
          'Neutralizing active threats',
          'Coordinating emergency response'
        ],
        'scanning': [
          'Performing comprehensive security scan',
          'Checking system vulnerabilities',
          'Auditing security configurations',
          'Scanning network perimeter',
          'Validating security controls'
        ],
        'monitoring': [
          'Monitoring system health metrics',
          'Observing network traffic patterns',
          'Watching for anomalous behavior',
          'Tracking security KPIs',
          'Maintaining surveillance protocols'
        ]
      };
      
      const activities = activitiesByStatus[currentStatus] || activitiesByStatus['active'];
      const currentActivity = activities[Math.abs(Math.floor(Math.sin(seed * 1.3) * activities.length))];

      return {
        id: agent.id,
        _id: agent.id, // Para compatibilidad con componentes React
        name: agent.name,
        type: agent.id,
        status: currentStatus,
        activity_level: Math.round(activityLevel),
        threats_detected: threatsDetected,
        actions_executed: actionsExecuted, // Nueva métrica
        last_activity: lastActivity.toISOString(),
        lastActivity: lastActivity.toISOString(), // Alias adicional
        current_activity: currentActivity,
        description: agent.description,
        location: this.locations[index % this.locations.length],
        version: '2.1.0',
        uptime: Math.floor(now / 1000) % 86400, // Segundos del día
        cpu_usage: Math.round(Math.sin(seed / 70) * 20 + 30), // 10-50%
        memory_usage: Math.round(Math.sin(seed / 80) * 30 + 40), // 10-70%
        response_time: Math.round(Math.sin(seed / 60) * 100 + 150), // 50-250ms
        alerts_processed: Math.floor(Math.sin(seed / 40) * 50 + 100), // 50-150
        metrics: {
          uptime: Math.round(95 + Math.sin(seed / 90) * 5), // 95-100%
          responseTime: Math.round((Math.sin(seed / 60) * 0.5 + 0.3) * 100) / 100, // 0.1-0.8s
          accuracy: Math.round(90 + Math.sin(seed / 100) * 10) // 90-100%
        }
      };
    });
  }

  // Generar alertas dinámicas
  getAlerts() {
    const now = Date.now();
    const alerts = [];
    const secondsSeed = Math.floor(now / 5000); // Cambiar cada 5 segundos
    const alertCount = 8 + Math.abs(Math.floor(Math.sin(secondsSeed) * 6)); // 8-14 alertas

    for (let i = 0; i < alertCount; i++) {
      const seed = now + i * 2000 + secondsSeed * 1000;
      const severities = ['low', 'medium', 'high', 'critical'];
      const statuses = ['active', 'investigating', 'resolved', 'mitigating'];
      
      const severity = severities[Math.abs(Math.floor(Math.sin(seed) * 4)) % 4];
      const status = statuses[Math.abs(Math.floor(Math.sin(seed * 1.1) * 4)) % 4];
      
      // Más variedad en tipos de amenazas con nombres más específicos
      const threatDetails = [
        { type: 'DDoS Attack', name: 'Massive Volumetric DDoS', icon: '🌊' },
        { type: 'Malware Detection', name: 'Advanced Persistent Threat', icon: '🦠' },
        { type: 'SQL Injection', name: 'Database Exploitation Attempt', icon: '💾' }, 
        { type: 'Phishing Campaign', name: 'Credential Harvesting Attack', icon: '🎣' },
        { type: 'Brute Force Attack', name: 'Password Cracking Attempt', icon: '🔨' },
        { type: 'Crypto Mining', name: 'Unauthorized Cryptocurrency Mining', icon: '⛏️' },
        { type: 'Data Exfiltration', name: 'Sensitive Data Theft Attempt', icon: '📤' },
        { type: 'Ransomware', name: 'File Encryption Malware', icon: '🔒' },
        { type: 'Zero-Day Exploit', name: 'Unknown Vulnerability Exploitation', icon: '⚡' },
        { type: 'Network Intrusion', name: 'Unauthorized Network Access', icon: '🚪' },
        { type: 'DNS Poisoning', name: 'DNS Cache Poisoning Attack', icon: '🧪' },
        { type: 'XSS Attack', name: 'Cross-Site Scripting Injection', icon: '🕷️' },
        { type: 'MITM Attack', name: 'Man-in-the-Middle Interception', icon: '👁️' },
        { type: 'Privilege Escalation', name: 'Admin Rights Exploitation', icon: '⬆️' },
        { type: 'API Abuse', name: 'REST API Rate Limit Violation', icon: '🔌' }
      ];
      
      const threatInfo = threatDetails[Math.abs(Math.floor(Math.sin(seed * 1.2) * threatDetails.length)) % threatDetails.length];
      const source = this.locations[Math.abs(Math.floor(Math.sin(seed * 1.3) * this.locations.length)) % this.locations.length];
      const agent = this.agentTypes[Math.abs(Math.floor(Math.sin(seed * 1.4) * this.agentTypes.length)) % this.agentTypes.length];

      // Timestamp que cambie más dinámicamente
      const alertTime = new Date(now - (Math.abs(Math.sin(seed + secondsSeed * 100)) * 1800000)); // Últimas 30 minutos

      // Descripciones más variadas con nombres de amenazas
      const descriptions = [
        `${threatInfo.name} detected from ${source} - immediate response required`,
        `Agent ${agent.name} identified ${threatInfo.name.toLowerCase()} targeting critical systems`,
        `Multiple ${threatInfo.type.toLowerCase()} attempts blocked from ${source}`,
        `Automated response triggered for ${threatInfo.name.toLowerCase()} incident`,
        `${threatInfo.name} attack pattern recognized and contained by security AI`,
        `Advanced ${threatInfo.name.toLowerCase()} neutralized before data compromise`
      ];

      const description = descriptions[Math.abs(Math.floor(Math.sin(seed * 1.5) * descriptions.length)) % descriptions.length];

      alerts.push({
        id: `alert-${secondsSeed}-${i + 1}`,
        title: threatInfo.type,
        name: threatInfo.name, // Nombre específico de la amenaza
        description,
        severity,
        status,
        source,
        timestamp: alertTime.toISOString(),
        agent_id: agent.id,
        threat_type: threatInfo.type,
        threat_icon: threatInfo.icon,
        confidence: Math.round(Math.sin(seed * 1.5) * 20 + 80), // 60-100%
        risk_score: Math.round(Math.sin(seed * 1.6) * 40 + 30), // 10-70%
        affected_systems: [source],
        mitigation_status: status === 'resolved' ? 'completed' : 'in_progress',
        source_ip: this.getRandomIP(seed),
        attempts_blocked: Math.floor(Math.sin(seed * 1.7) * 100 + 1),
        detection_time: new Date(now - (Math.abs(Math.sin(seed * 1.8)) * 300000)).toISOString() // Tiempo de detección
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
    const secondsSeed = Math.floor(now / 5000); // Cambiar cada 5 segundos

    const activeAlerts = alerts.filter(alert => alert.status === 'active').length;
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical').length;
    const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved').length;
    
    // Calcular amenazas totales de todos los agentes
    const totalThreats = agents.reduce((sum, agent) => sum + agent.threats_detected, 0);
    const totalActions = agents.reduce((sum, agent) => sum + (agent.actions_executed || 0), 0);
    
    // Métricas dinámicas de seguridad
    const securityMetrics = {
      threat_detection_rate: Math.round(85 + Math.sin(secondsSeed * 0.1) * 15), // 70-100%
      false_positive_rate: Math.round(2 + Math.sin(secondsSeed * 0.15) * 3), // 0-5%
      response_efficiency: Math.round(92 + Math.sin(secondsSeed * 0.12) * 8), // 84-100%
      system_resilience: Math.round(96 + Math.sin(secondsSeed * 0.08) * 4), // 92-100%
      threat_intelligence_score: Math.round(88 + Math.sin(secondsSeed * 0.14) * 12), // 76-100%
      incident_resolution_time: Math.round(45 + Math.sin(secondsSeed * 0.2) * 25), // 20-70 minutos
      network_security_level: Math.round(94 + Math.sin(secondsSeed * 0.11) * 6), // 88-100%
      data_protection_index: Math.round(97 + Math.sin(secondsSeed * 0.09) * 3) // 94-100%
    };

    return {
      timestamp: new Date().toISOString(),
      agents: {
        total: agents.length,
        active: agents.filter(a => a.status === 'active').length,
        investigating: agents.filter(a => a.status === 'investigating').length,
        responding: agents.filter(a => a.status === 'responding').length,
        scanning: agents.filter(a => a.status === 'scanning').length,
        monitoring: agents.filter(a => a.status === 'monitoring').length,
        average_activity: Math.round(agents.reduce((sum, a) => sum + a.activity_level, 0) / agents.length),
        total_threats_detected: totalThreats,
        total_actions_executed: totalActions
      },
      alerts: {
        total: alerts.length,
        active: activeAlerts,
        critical: criticalAlerts,
        high: alerts.filter(alert => alert.severity === 'high').length,
        medium: alerts.filter(alert => alert.severity === 'medium').length,
        low: alerts.filter(alert => alert.severity === 'low').length,
        resolved: resolvedAlerts,
        investigating: alerts.filter(alert => alert.status === 'investigating').length,
        mitigating: alerts.filter(alert => alert.status === 'mitigating').length
      },
      threats: {
        total_detected: totalThreats,
        blocked: Math.floor(totalThreats * (0.92 + Math.sin(secondsSeed * 0.13) * 0.08)), // 92-100%
        mitigated: Math.floor(totalThreats * (0.88 + Math.sin(secondsSeed * 0.16) * 0.12)), // 88-100%
        active_threats: Math.max(0, Math.floor(totalThreats * (0.05 - Math.sin(secondsSeed * 0.18) * 0.05))), // 0-5%
        neutralized_today: Math.floor(50 + Math.sin(secondsSeed * 0.25) * 30), // 20-80
        prevention_rate: Math.round(94 + Math.sin(secondsSeed * 0.17) * 6) // 88-100%
      },
      security_metrics: securityMetrics,
      system: {
        uptime: Math.round(99.5 + Math.sin(secondsSeed * 0.05) * 0.5), // 99.0-100.0%
        cpu_usage: Math.round(Math.sin(secondsSeed * 0.1) * 20 + 45), // 25-65%
        memory_usage: Math.round(Math.sin(secondsSeed * 0.15) * 25 + 50), // 25-75%
        disk_usage: Math.round(Math.sin(secondsSeed * 0.12) * 20 + 40), // 20-60%
        network_traffic: Math.round(Math.sin(secondsSeed * 0.2) * 1000 + 2000), // 1000-3000 MB/s
        bandwidth_utilization: Math.round(Math.sin(secondsSeed * 0.18) * 30 + 35), // 5-65%
        connection_count: Math.round(Math.sin(secondsSeed * 0.22) * 500 + 1200), // 700-1700
        last_update: new Date().toISOString()
      },
      performance: {
        response_time: Math.round(Math.sin(secondsSeed * 0.3) * 50 + 100), // 50-150ms
        throughput: Math.round(Math.sin(secondsSeed * 0.25) * 500 + 1500), // 1000-2000 req/s
        error_rate: Math.round(Math.sin(secondsSeed * 0.35) * 1.5 + 0.5), // 0-2%
        availability: Math.round((99.9 + Math.sin(secondsSeed * 0.1) * 0.09) * 100) / 100, // 99.81-99.99%
        latency_p99: Math.round(Math.sin(secondsSeed * 0.28) * 200 + 300), // 100-500ms
        success_rate: Math.round(98 + Math.sin(secondsSeed * 0.14) * 2) // 96-100%
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

  // Generar IP aleatoria para demo
  getRandomIP(seed) {
    const a = Math.abs(Math.floor(Math.sin(seed) * 255));
    const b = Math.abs(Math.floor(Math.sin(seed * 1.1) * 255));
    const c = Math.abs(Math.floor(Math.sin(seed * 1.2) * 255));
    const d = Math.abs(Math.floor(Math.sin(seed * 1.3) * 255));
    return `${a}.${b}.${c}.${d}`;
  }

  // Generar país aleatorio para demo
  getRandomCountry(seed) {
    const countries = [
      'United States', 'China', 'Russia', 'Germany', 'Brazil', 
      'India', 'France', 'United Kingdom', 'Turkey', 'Iran',
      'North Korea', 'Netherlands', 'Canada', 'Australia', 'Japan'
    ];
    return countries[Math.abs(Math.floor(Math.sin(seed * 2.1) * countries.length)) % countries.length];
  }
}

module.exports = NetlifySimulationService;

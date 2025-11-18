const express = require('express');
const router = express.Router();

// Simulación de datos de inteligencia de amenazas
const threatIntelData = [
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

// GET /api/threats - Obtener inteligencia de amenazas
router.get('/', async (req, res) => {
  try {
    const { severity, limit = 50, source } = req.query;
    
    let filteredThreats = [...threatIntelData];
    
    if (severity) {
      filteredThreats = filteredThreats.filter(threat => threat.severity === severity);
    }
    
    if (source) {
      filteredThreats = filteredThreats.filter(threat => threat.source === source);
    }
    
    filteredThreats = filteredThreats.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: filteredThreats,
      count: filteredThreats.length,
      total: threatIntelData.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/threats/:id - Obtener amenaza específica
router.get('/:id', async (req, res) => {
  try {
    const threat = threatIntelData.find(t => t.id === req.params.id);
    
    if (!threat) {
      return res.status(404).json({
        success: false,
        error: 'Amenaza no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: threat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/threats/stats/overview - Obtener estadísticas de amenazas
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = {
      total: threatIntelData.length,
      critical: threatIntelData.filter(t => t.severity === 'critical').length,
      high: threatIntelData.filter(t => t.severity === 'high').length,
      medium: threatIntelData.filter(t => t.severity === 'medium').length,
      low: threatIntelData.filter(t => t.severity === 'low').length,
      averageConfidence: Math.round(
        threatIntelData.reduce((sum, t) => sum + t.confidence, 0) / threatIntelData.length
      ),
      sources: [...new Set(threatIntelData.map(t => t.source))],
      recentThreats: threatIntelData
        .filter(t => t.lastSeen > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .length
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/threats/search - Buscar amenazas por indicadores
router.post('/search', async (req, res) => {
  try {
    const { indicators = [], threatType, minConfidence = 0 } = req.body;
    
    const matchingThreats = threatIntelData.filter(threat => {
      const indicatorMatch = indicators.length === 0 || 
        indicators.some(indicator => 
          threat.indicators.some(ti => ti.toLowerCase().includes(indicator.toLowerCase()))
        );
      
      const typeMatch = !threatType || threat.type.toLowerCase().includes(threatType.toLowerCase());
      const confidenceMatch = threat.confidence >= minConfidence;
      
      return indicatorMatch && typeMatch && confidenceMatch;
    });
    
    res.json({
      success: true,
      data: matchingThreats,
      count: matchingThreats.length,
      searchCriteria: { indicators, threatType, minConfidence }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/threats - Agregar nueva amenaza
router.post('/', async (req, res) => {
  try {
    const newThreat = {
      id: `threat-${Date.now()}`,
      lastSeen: new Date(),
      confidence: 50,
      source: 'user_reported',
      ...req.body
    };
    
    threatIntelData.push(newThreat);
    
    res.status(201).json({
      success: true,
      data: newThreat,
      message: 'Amenaza agregada exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/threats/:id/confidence - Actualizar nivel de confianza
router.put('/:id/confidence', async (req, res) => {
  try {
    const { confidence } = req.body;
    
    if (confidence < 0 || confidence > 100) {
      return res.status(400).json({
        success: false,
        error: 'La confianza debe estar entre 0 y 100'
      });
    }
    
    const threatIndex = threatIntelData.findIndex(t => t.id === req.params.id);
    
    if (threatIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Amenaza no encontrada'
      });
    }
    
    threatIntelData[threatIndex].confidence = confidence;
    
    res.json({
      success: true,
      data: threatIntelData[threatIndex],
      message: 'Nivel de confianza actualizado'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/threats/feeds/active - Obtener feeds activos de amenazas
router.get('/feeds/active', async (req, res) => {
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
    
    res.json({
      success: true,
      data: activeFeeds,
      count: activeFeeds.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

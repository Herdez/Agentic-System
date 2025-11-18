const express = require('express');
const router = express.Router();
const AlertService = require('../services/AlertService');

// GET /api/alerts - Obtener alertas recientes
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const alerts = await AlertService.getRecentAlerts(limit);
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/alerts/critical - Obtener alertas críticas
router.get('/critical', async (req, res) => {
  try {
    const alerts = await AlertService.getCriticalAlerts();
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/alerts/severity/:severity - Obtener alertas por severidad
router.get('/severity/:severity', async (req, res) => {
  try {
    const alerts = await AlertService.getAlertsBySeverity(req.params.severity);
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/alerts/agent/:agentId - Obtener alertas por agente
router.get('/agent/:agentId', async (req, res) => {
  try {
    const alerts = await AlertService.getAlertsByAgent(req.params.agentId);
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/alerts/type/:agentType - Obtener alertas por tipo de agente
router.get('/type/:agentType', async (req, res) => {
  try {
    const alerts = await AlertService.getAlertsByAgentType(req.params.agentType);
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/alerts/stats - Obtener estadísticas de alertas
router.get('/stats', async (req, res) => {
  try {
    const timeframe = parseInt(req.query.timeframe) || 24;
    const stats = await AlertService.getAlertStatistics(timeframe);
    
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

// GET /api/alerts/trends - Obtener tendencias de alertas
router.get('/trends', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const trends = await AlertService.getAlertTrends(days);
    
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/alerts/geographic - Obtener alertas geográficas
router.get('/geographic', async (req, res) => {
  try {
    const geoAlerts = await AlertService.getGeographicAlerts();
    
    res.json({
      success: true,
      data: geoAlerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/alerts/search - Buscar alertas
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 50 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Parámetro de búsqueda "q" es requerido'
      });
    }

    const alerts = await AlertService.searchAlerts(q, parseInt(limit));
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
      query: q
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/alerts - Crear nueva alerta
router.post('/', async (req, res) => {
  try {
    const alert = await AlertService.createAlert(req.body);
    
    res.status(201).json({
      success: true,
      data: alert,
      message: 'Alerta creada exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/alerts/:id/resolve - Resolver alerta
router.put('/:id/resolve', async (req, res) => {
  try {
    const { resolvedBy, resolution } = req.body;
    
    if (!resolvedBy || !resolution) {
      return res.status(400).json({
        success: false,
        error: 'resolvedBy y resolution son requeridos'
      });
    }

    const alert = await AlertService.resolveAlert(req.params.id, resolvedBy, resolution);
    
    res.json({
      success: true,
      data: alert,
      message: 'Alerta resuelta exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/alerts/:id/escalate - Escalar alerta
router.put('/:id/escalate', async (req, res) => {
  try {
    const alert = await AlertService.escalateAlert(req.params.id);
    
    res.json({
      success: true,
      data: alert,
      message: 'Alerta escalada exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/alerts/:id/status - Actualizar estado de alerta
router.put('/:id/status', async (req, res) => {
  try {
    const { status, ...updateData } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'status es requerido'
      });
    }

    const alert = await AlertService.updateAlertStatus(req.params.id, status, updateData);
    
    res.json({
      success: true,
      data: alert,
      message: 'Estado de alerta actualizado'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/alerts/:id/false-positive - Marcar como falso positivo
router.put('/:id/false-positive', async (req, res) => {
  try {
    const { reason } = req.body;
    const alert = await AlertService.markAsFalsePositive(req.params.id, reason || 'Sin razón especificada');
    
    res.json({
      success: true,
      data: alert,
      message: 'Alerta marcada como falso positivo'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/alerts/:id/action - Agregar acción recomendada
router.post('/:id/action', async (req, res) => {
  try {
    const { action, priority = 5 } = req.body;
    
    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'action es requerido'
      });
    }

    const alert = await AlertService.addRecommendedAction(req.params.id, action, priority);
    
    res.json({
      success: true,
      data: alert,
      message: 'Acción recomendada agregada'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

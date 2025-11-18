const Alert = require('../models/Alert');

class AlertService {
  
  // Crear nueva alerta
  static async createAlert(alertData) {
    try {
      const alert = new Alert(alertData);
      await alert.save();
      
      console.log(`🚨 Nueva alerta: ${alert.type} - ${alert.message}`);
      return alert;
    } catch (error) {
      console.error('Error creando alerta:', error);
      throw error;
    }
  }

  // Obtener alertas recientes
  static async getRecentAlerts(limit = 50) {
    try {
      return await Alert.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('agentId', 'name type status');
    } catch (error) {
      console.error('Error obteniendo alertas recientes:', error);
      throw error;
    }
  }

  // Obtener alertas por severidad
  static async getAlertsBySeverity(severity) {
    try {
      return await Alert.find({ severity })
        .sort({ createdAt: -1 })
        .populate('agentId', 'name type');
    } catch (error) {
      console.error('Error obteniendo alertas por severidad:', error);
      throw error;
    }
  }

  // Obtener alertas críticas activas
  static async getCriticalAlerts() {
    try {
      return await Alert.find({ 
        severity: 'critical', 
        status: { $in: ['open', 'investigating'] } 
      })
      .sort({ createdAt: -1 })
      .populate('agentId', 'name type');
    } catch (error) {
      console.error('Error obteniendo alertas críticas:', error);
      throw error;
    }
  }

  // Resolver alerta
  static async resolveAlert(alertId, resolvedBy, resolution) {
    try {
      const alert = await Alert.findById(alertId);
      if (!alert) {
        throw new Error('Alerta no encontrada');
      }

      await alert.resolve(resolvedBy, resolution);
      
      console.log(`✅ Alerta ${alertId} resuelta por ${resolvedBy}`);
      return alert;
    } catch (error) {
      console.error('Error resolviendo alerta:', error);
      throw error;
    }
  }

  // Escalar alerta
  static async escalateAlert(alertId) {
    try {
      const alert = await Alert.findById(alertId);
      if (!alert) {
        throw new Error('Alerta no encontrada');
      }

      await alert.escalate();
      
      console.log(`⬆️ Alerta ${alertId} escalada a ${alert.severity}`);
      return alert;
    } catch (error) {
      console.error('Error escalando alerta:', error);
      throw error;
    }
  }

  // Obtener estadísticas de alertas
  static async getAlertStatistics(timeframe = 24) {
    try {
      const hoursAgo = new Date(Date.now() - timeframe * 60 * 60 * 1000);
      
      const stats = await Alert.aggregate([
        {
          $match: {
            createdAt: { $gte: hoursAgo }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
            high: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } },
            medium: { $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] } },
            low: { $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] } },
            open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
            resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
          }
        }
      ]);

      return stats[0] || {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        open: 0,
        resolved: 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de alertas:', error);
      throw error;
    }
  }

  // Obtener alertas por agente
  static async getAlertsByAgent(agentId) {
    try {
      return await Alert.find({ agentId })
        .sort({ createdAt: -1 })
        .populate('agentId', 'name type');
    } catch (error) {
      console.error('Error obteniendo alertas por agente:', error);
      throw error;
    }
  }

  // Obtener alertas por tipo de agente
  static async getAlertsByAgentType(agentType) {
    try {
      return await Alert.find({ agentType })
        .sort({ createdAt: -1 })
        .limit(100);
    } catch (error) {
      console.error('Error obteniendo alertas por tipo de agente:', error);
      throw error;
    }
  }

  // Marcar alerta como falso positivo
  static async markAsFalsePositive(alertId, reason) {
    try {
      const alert = await Alert.findByIdAndUpdate(
        alertId,
        { 
          status: 'false_positive',
          resolution: {
            resolvedBy: 'system',
            resolvedAt: new Date(),
            resolution: `Marcado como falso positivo: ${reason}`,
            timeToResolve: Math.round((new Date() - alert.createdAt) / (1000 * 60))
          }
        },
        { new: true }
      );

      console.log(`🚫 Alerta ${alertId} marcada como falso positivo`);
      return alert;
    } catch (error) {
      console.error('Error marcando como falso positivo:', error);
      throw error;
    }
  }

  // Obtener tendencias de alertas
  static async getAlertTrends(days = 7) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const trends = await Alert.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              severity: '$severity'
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.date': 1 }
        }
      ]);

      return trends;
    } catch (error) {
      console.error('Error obteniendo tendencias:', error);
      throw error;
    }
  }

  // Obtener alertas geográficas
  static async getGeographicAlerts() {
    try {
      const geoAlerts = await Alert.aggregate([
        {
          $match: {
            'geolocation.coordinates': { $exists: true },
            status: { $in: ['open', 'investigating'] }
          }
        },
        {
          $group: {
            _id: {
              country: '$geolocation.country',
              coordinates: '$geolocation.coordinates'
            },
            count: { $sum: 1 },
            maxSeverity: { $max: '$severity' },
            alerts: {
              $push: {
                id: '$_id',
                message: '$message',
                type: '$type',
                severity: '$severity',
                createdAt: '$createdAt'
              }
            }
          }
        }
      ]);

      return geoAlerts;
    } catch (error) {
      console.error('Error obteniendo alertas geográficas:', error);
      throw error;
    }
  }

  // Actualizar estado de alerta
  static async updateAlertStatus(alertId, status, updateData = {}) {
    try {
      const alert = await Alert.findByIdAndUpdate(
        alertId,
        { 
          status,
          ...updateData,
          lastModified: new Date()
        },
        { new: true }
      );

      if (!alert) {
        throw new Error('Alerta no encontrada');
      }

      console.log(`📝 Alerta ${alertId} actualizada a estado: ${status}`);
      return alert;
    } catch (error) {
      console.error('Error actualizando estado de alerta:', error);
      throw error;
    }
  }

  // Agregar acción recomendada a alerta
  static async addRecommendedAction(alertId, action, priority = 5) {
    try {
      const alert = await Alert.findById(alertId);
      if (!alert) {
        throw new Error('Alerta no encontrada');
      }

      await alert.addRecommendedAction(action, priority);
      
      console.log(`💡 Acción recomendada agregada a alerta ${alertId}: ${action}`);
      return alert;
    } catch (error) {
      console.error('Error agregando acción recomendada:', error);
      throw error;
    }
  }

  // Buscar alertas por texto
  static async searchAlerts(searchText, limit = 50) {
    try {
      const searchRegex = new RegExp(searchText, 'i');
      
      return await Alert.find({
        $or: [
          { message: searchRegex },
          { description: searchRegex },
          { 'details.description': searchRegex }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('agentId', 'name type');
    } catch (error) {
      console.error('Error buscando alertas:', error);
      throw error;
    }
  }
}

module.exports = AlertService;

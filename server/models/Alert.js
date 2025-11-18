const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['INFO', 'WARNING', 'CRITICAL', 'ERROR'],
    default: 'INFO'
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  agentType: {
    type: String,
    enum: [
      'intrusion_detection',
      'incident_response', 
      'vulnerability_analysis',
      'threat_intelligence',
      'defense_coordination',
      'audit_compliance',
      'recovery_resilience'
    ]
  },
  source: {
    type: String,
    default: 'system'
  },
  category: {
    type: String,
    enum: [
      'security_breach',
      'network_anomaly', 
      'system_update',
      'threat_detected',
      'vulnerability_found',
      'compliance_violation',
      'performance_issue',
      'maintenance_required'
    ]
  },
  status: {
    type: String,
    enum: ['open', 'investigating', 'resolved', 'closed', 'false_positive'],
    default: 'open'
  },
  priority: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  affectedSystems: [{
    type: String
  }],
  recommendedActions: [{
    action: String,
    priority: Number,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  resolution: {
    resolvedBy: String,
    resolvedAt: Date,
    resolution: String,
    timeToResolve: Number // en minutos
  },
  tags: [{
    type: String
  }],
  geolocation: {
    country: String,
    region: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    requestId: String,
    correlationId: String
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
AlertSchema.index({ type: 1, severity: 1 });
AlertSchema.index({ status: 1 });
AlertSchema.index({ agentType: 1 });
AlertSchema.index({ priority: -1 });
AlertSchema.index({ createdAt: -1 });
AlertSchema.index({ 'geolocation.country': 1 });

// Middleware pre-save
AlertSchema.pre('save', function(next) {
  if (this.isNew) {
    // Asignar prioridad automáticamente basada en severity
    switch(this.severity) {
      case 'critical':
        this.priority = 10;
        break;
      case 'high':
        this.priority = Math.max(7, this.priority);
        break;
      case 'medium':
        this.priority = Math.max(5, this.priority);
        break;
      case 'low':
        this.priority = Math.min(3, this.priority);
        break;
    }
    
    // Categorización automática basada en el tipo de agente
    if (!this.category && this.agentType) {
      const categoryMap = {
        'intrusion_detection': 'security_breach',
        'incident_response': 'threat_detected',
        'vulnerability_analysis': 'vulnerability_found',
        'threat_intelligence': 'threat_detected',
        'defense_coordination': 'system_update',
        'audit_compliance': 'compliance_violation',
        'recovery_resilience': 'performance_issue'
      };
      this.category = categoryMap[this.agentType] || 'system_update';
    }
  }
  next();
});

// Métodos del esquema
AlertSchema.methods.resolve = function(resolvedBy, resolution) {
  this.status = 'resolved';
  this.resolution = {
    resolvedBy,
    resolvedAt: new Date(),
    resolution,
    timeToResolve: Math.round((new Date() - this.createdAt) / (1000 * 60)) // minutos
  };
  return this.save();
};

AlertSchema.methods.escalate = function() {
  if (this.priority < 10) {
    this.priority += 1;
  }
  if (this.severity === 'low') this.severity = 'medium';
  else if (this.severity === 'medium') this.severity = 'high';
  else if (this.severity === 'high') this.severity = 'critical';
  
  return this.save();
};

AlertSchema.methods.addRecommendedAction = function(action, priority = 5) {
  this.recommendedActions.push({
    action,
    priority,
    completed: false
  });
  return this.save();
};

// Métodos estáticos
AlertSchema.statics.getRecentAlerts = function(limit = 50) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('agentId', 'name type');
};

AlertSchema.statics.getCriticalAlerts = function() {
  return this.find({ 
    severity: 'critical', 
    status: { $in: ['open', 'investigating'] } 
  })
  .sort({ createdAt: -1 })
  .populate('agentId', 'name type');
};

AlertSchema.statics.getAlertsByAgent = function(agentType) {
  return this.find({ agentType })
    .sort({ createdAt: -1 })
    .limit(100);
};

AlertSchema.statics.getAlertStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] } },
        low: { $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] } },
        open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        avgTimeToResolve: { $avg: '$resolution.timeToResolve' }
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
    resolved: 0,
    avgTimeToResolve: 0
  };
};

module.exports = mongoose.model('Alert', AlertSchema);

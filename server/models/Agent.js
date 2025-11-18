const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
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
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'error', 'scanning'],
    default: 'active'
  },
  description: {
    type: String,
    required: true
  },
  capabilities: [{
    type: String
  }],
  metrics: {
    threatsDetected: {
      type: Number,
      default: 0
    },
    actionsExecuted: {
      type: Number,
      default: 0
    },
    uptime: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    responseTime: {
      type: Number,
      default: 0.3
    },
    accuracy: {
      type: Number,
      default: 95.5,
      min: 0,
      max: 100
    },
    // Métricas específicas por tipo de agente
    incidentsResolved: {
      type: Number,
      default: 0
    },
    vulnerabilitiesFound: {
      type: Number,
      default: 0
    },
    threatIntelUpdates: {
      type: Number,
      default: 0
    },
    coordinationActions: {
      type: Number,
      default: 0
    },
    complianceChecks: {
      type: Number,
      default: 0
    },
    backupsCompleted: {
      type: Number,
      default: 0
    }
  },
  configuration: {
    priority: {
      type: Number,
      default: 5,
      min: 1,
      max: 10
    },
    autoResponse: {
      type: Boolean,
      default: true
    },
    alertThreshold: {
      type: Number,
      default: 3
    }
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  networkLocation: {
    region: String,
    node: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
AgentSchema.index({ type: 1, status: 1 });
AgentSchema.index({ 'metrics.threatsDetected': -1 });
AgentSchema.index({ lastActivity: -1 });

// Métodos del esquema
AgentSchema.methods.updateMetrics = function(metric, value) {
  this.metrics[metric] = value;
  this.lastActivity = new Date();
  return this.save();
};

AgentSchema.methods.executeAction = function(action) {
  this.metrics.actionsExecuted += 1;
  this.lastActivity = new Date();
  
  switch(action) {
    case 'scan':
      this.status = 'scanning';
      break;
    case 'activate':
      this.status = 'active';
      break;
    case 'deactivate':
      this.status = 'inactive';
      break;
    case 'maintenance':
      this.status = 'maintenance';
      break;
  }
  
  return this.save();
};

// Métodos estáticos
AgentSchema.statics.getActiveAgents = function() {
  return this.find({ status: 'active' });
};

AgentSchema.statics.getAgentsByType = function(type) {
  return this.find({ type });
};

AgentSchema.statics.getSystemOverview = async function() {
  const total = await this.countDocuments();
  const active = await this.countDocuments({ status: 'active' });
  const inactive = await this.countDocuments({ status: 'inactive' });
  const maintenance = await this.countDocuments({ status: 'maintenance' });
  const error = await this.countDocuments({ status: 'error' });
  
  return {
    total,
    active,
    inactive,
    maintenance,
    error,
    healthPercentage: Math.round((active / total) * 100)
  };
};

module.exports = mongoose.model('Agent', AgentSchema);

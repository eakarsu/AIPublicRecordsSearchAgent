const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FoiaRequest = sequelize.define('FoiaRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  agency: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'denied', 'appealed'), defaultValue: 'pending' },
  description: { type: DataTypes.TEXT },
  requestDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  responseDate: { type: DataTypes.DATE },
  requestorName: { type: DataTypes.STRING },
  requestorEmail: { type: DataTypes.STRING },
  trackingNumber: { type: DataTypes.STRING },
  estimatedCost: { type: DataTypes.DECIMAL(10, 2) },
  category: { type: DataTypes.STRING },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'), defaultValue: 'medium' },
  aiAnalysis: { type: DataTypes.JSONB }
});

module.exports = FoiaRequest;

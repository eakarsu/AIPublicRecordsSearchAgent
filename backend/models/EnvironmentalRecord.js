const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EnvironmentalRecord = sequelize.define('EnvironmentalRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  siteName: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  recordType: { type: DataTypes.ENUM('contamination', 'permit', 'violation', 'assessment', 'remediation'), allowNull: false },
  agency: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('open', 'closed', 'monitoring', 'remediation', 'compliant'), defaultValue: 'open' },
  contaminants: { type: DataTypes.JSONB, defaultValue: [] },
  reportDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  cleanupCost: { type: DataTypes.DECIMAL(12, 2) },
  riskLevel: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), defaultValue: 'medium' },
  description: { type: DataTypes.TEXT },
  responsibleParty: { type: DataTypes.STRING },
  aiAnalysis: { type: DataTypes.JSONB }
});

module.exports = EnvironmentalRecord;

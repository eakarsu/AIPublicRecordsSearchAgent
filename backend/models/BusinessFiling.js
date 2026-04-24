const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BusinessFiling = sequelize.define('BusinessFiling', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  businessName: { type: DataTypes.STRING, allowNull: false },
  entityType: { type: DataTypes.ENUM('LLC', 'Corporation', 'Partnership', 'Sole Proprietorship', 'Non-Profit'), allowNull: false },
  stateOfIncorporation: { type: DataTypes.STRING, allowNull: false },
  filingNumber: { type: DataTypes.STRING },
  registeredAgent: { type: DataTypes.STRING },
  principalAddress: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('active', 'inactive', 'dissolved', 'suspended', 'revoked'), defaultValue: 'active' },
  filingDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  annualReportDue: { type: DataTypes.DATE },
  officers: { type: DataTypes.JSONB, defaultValue: [] },
  industry: { type: DataTypes.STRING },
  ein: { type: DataTypes.STRING },
  aiAnalysis: { type: DataTypes.JSONB }
});

module.exports = BusinessFiling;

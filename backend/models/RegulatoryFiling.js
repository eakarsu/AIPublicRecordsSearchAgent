const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RegulatoryFiling = sequelize.define('RegulatoryFiling', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  filingType: { type: DataTypes.STRING, allowNull: false },
  entityName: { type: DataTypes.STRING, allowNull: false },
  regulatoryBody: { type: DataTypes.STRING, allowNull: false },
  filingNumber: { type: DataTypes.STRING },
  filingDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  dueDate: { type: DataTypes.DATE },
  status: { type: DataTypes.ENUM('submitted', 'under_review', 'approved', 'rejected', 'amended'), defaultValue: 'submitted' },
  description: { type: DataTypes.TEXT },
  industry: { type: DataTypes.STRING },
  complianceScore: { type: DataTypes.INTEGER },
  penaltyAmount: { type: DataTypes.DECIMAL(10, 2) },
  documents: { type: DataTypes.JSONB, defaultValue: [] },
  aiAnalysis: { type: DataTypes.JSONB }
});

module.exports = RegulatoryFiling;

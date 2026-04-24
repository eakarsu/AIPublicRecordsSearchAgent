const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BuildingPermit = sequelize.define('BuildingPermit', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  permitNumber: { type: DataTypes.STRING, allowNull: false },
  propertyAddress: { type: DataTypes.STRING, allowNull: false },
  permitType: { type: DataTypes.ENUM('new_construction', 'renovation', 'demolition', 'electrical', 'plumbing', 'mechanical'), allowNull: false },
  applicantName: { type: DataTypes.STRING },
  contractorName: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('applied', 'approved', 'denied', 'expired', 'completed', 'inspection_pending'), defaultValue: 'applied' },
  applicationDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  approvalDate: { type: DataTypes.DATE },
  estimatedCost: { type: DataTypes.DECIMAL(12, 2) },
  description: { type: DataTypes.TEXT },
  inspections: { type: DataTypes.JSONB, defaultValue: [] },
  municipality: { type: DataTypes.STRING },
  aiAnalysis: { type: DataTypes.JSONB }
});

module.exports = BuildingPermit;

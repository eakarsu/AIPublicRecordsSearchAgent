const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TaxLien = sequelize.define('TaxLien', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  lienNumber: { type: DataTypes.STRING, allowNull: false },
  debtorName: { type: DataTypes.STRING, allowNull: false },
  lienType: { type: DataTypes.ENUM('federal', 'state', 'property', 'income', 'payroll'), allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  filingDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  releaseDate: { type: DataTypes.DATE },
  status: { type: DataTypes.ENUM('active', 'released', 'subordinated', 'expired', 'paid'), defaultValue: 'active' },
  propertyAddress: { type: DataTypes.STRING },
  jurisdiction: { type: DataTypes.STRING },
  taxYear: { type: DataTypes.INTEGER },
  interestRate: { type: DataTypes.DECIMAL(5, 2) },
  penaltyAmount: { type: DataTypes.DECIMAL(10, 2) },
  aiAnalysis: { type: DataTypes.JSONB }
});

module.exports = TaxLien;

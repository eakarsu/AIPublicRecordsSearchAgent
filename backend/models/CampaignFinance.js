const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CampaignFinance = sequelize.define('CampaignFinance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  committeeName: { type: DataTypes.STRING, allowNull: false },
  candidateName: { type: DataTypes.STRING },
  office: { type: DataTypes.STRING },
  party: { type: DataTypes.STRING },
  filingType: { type: DataTypes.ENUM('contribution', 'expenditure', 'quarterly', 'annual', 'amendment'), allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  donorName: { type: DataTypes.STRING },
  donorAddress: { type: DataTypes.STRING },
  filingDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  electionCycle: { type: DataTypes.STRING },
  reportingPeriod: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('filed', 'amended', 'under_review', 'approved', 'flagged'), defaultValue: 'filed' },
  aiAnalysis: { type: DataTypes.JSONB }
});

module.exports = CampaignFinance;

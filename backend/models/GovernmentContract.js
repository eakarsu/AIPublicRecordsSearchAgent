const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GovernmentContract = sequelize.define('GovernmentContract', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  contractNumber: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  agency: { type: DataTypes.STRING, allowNull: false },
  vendorName: { type: DataTypes.STRING, allowNull: false },
  contractValue: { type: DataTypes.DECIMAL(14, 2) },
  startDate: { type: DataTypes.DATE },
  endDate: { type: DataTypes.DATE },
  status: { type: DataTypes.ENUM('active', 'completed', 'terminated', 'pending', 'awarded'), defaultValue: 'active' },
  contractType: { type: DataTypes.ENUM('fixed_price', 'cost_plus', 'time_materials', 'indefinite_delivery', 'blanket'), defaultValue: 'fixed_price' },
  description: { type: DataTypes.TEXT },
  setAside: { type: DataTypes.STRING },
  naicsCode: { type: DataTypes.STRING },
  placeOfPerformance: { type: DataTypes.STRING },
  aiAnalysis: { type: DataTypes.JSONB }
});

module.exports = GovernmentContract;

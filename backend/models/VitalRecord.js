const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VitalRecord = sequelize.define('VitalRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  recordType: { type: DataTypes.ENUM('birth', 'death', 'marriage', 'divorce'), allowNull: false },
  fullName: { type: DataTypes.STRING, allowNull: false },
  dateOfEvent: { type: DataTypes.DATE, allowNull: false },
  county: { type: DataTypes.STRING },
  state: { type: DataTypes.STRING, allowNull: false },
  certificateNumber: { type: DataTypes.STRING },
  filingDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  additionalNames: { type: DataTypes.JSONB, defaultValue: [] },
  location: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('verified', 'pending', 'amended', 'sealed'), defaultValue: 'verified' },
  notes: { type: DataTypes.TEXT },
  aiAnalysis: { type: DataTypes.JSONB }
});

module.exports = VitalRecord;

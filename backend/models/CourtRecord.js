const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourtRecord = sequelize.define('CourtRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  caseNumber: { type: DataTypes.STRING, allowNull: false },
  caseTitle: { type: DataTypes.STRING, allowNull: false },
  court: { type: DataTypes.STRING, allowNull: false },
  judge: { type: DataTypes.STRING },
  plaintiff: { type: DataTypes.STRING },
  defendant: { type: DataTypes.STRING },
  caseType: { type: DataTypes.ENUM('civil', 'criminal', 'family', 'bankruptcy', 'appellate'), defaultValue: 'civil' },
  filingDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.ENUM('open', 'closed', 'settled', 'dismissed', 'appealed'), defaultValue: 'open' },
  description: { type: DataTypes.TEXT },
  jurisdiction: { type: DataTypes.STRING },
  damagesAmount: { type: DataTypes.DECIMAL(12, 2) },
  nextHearing: { type: DataTypes.DATE },
  aiAnalysis: { type: DataTypes.JSONB }
});

module.exports = CourtRecord;

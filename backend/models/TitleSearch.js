const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TitleSearch = sequelize.define('TitleSearch', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  propertyAddress: { type: DataTypes.STRING, allowNull: false },
  county: { type: DataTypes.STRING, allowNull: false },
  state: { type: DataTypes.STRING, allowNull: false },
  ownerName: { type: DataTypes.STRING },
  parcelNumber: { type: DataTypes.STRING },
  legalDescription: { type: DataTypes.TEXT },
  titleStatus: { type: DataTypes.ENUM('clear', 'encumbered', 'pending', 'disputed'), defaultValue: 'pending' },
  searchDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  liens: { type: DataTypes.JSONB, defaultValue: [] },
  encumbrances: { type: DataTypes.JSONB, defaultValue: [] },
  assessedValue: { type: DataTypes.DECIMAL(12, 2) },
  marketValue: { type: DataTypes.DECIMAL(12, 2) },
  propertyType: { type: DataTypes.STRING },
  yearBuilt: { type: DataTypes.INTEGER },
  aiAnalysis: { type: DataTypes.JSONB }
});

module.exports = TitleSearch;

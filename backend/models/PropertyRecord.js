const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PropertyRecord = sequelize.define('PropertyRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  address: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  state: { type: DataTypes.STRING, allowNull: false },
  zipCode: { type: DataTypes.STRING },
  ownerName: { type: DataTypes.STRING },
  propertyType: { type: DataTypes.ENUM('residential', 'commercial', 'industrial', 'agricultural', 'vacant'), defaultValue: 'residential' },
  assessedValue: { type: DataTypes.DECIMAL(12, 2) },
  marketValue: { type: DataTypes.DECIMAL(12, 2) },
  taxAmount: { type: DataTypes.DECIMAL(10, 2) },
  squareFeet: { type: DataTypes.INTEGER },
  lotSize: { type: DataTypes.DECIMAL(10, 2) },
  yearBuilt: { type: DataTypes.INTEGER },
  bedrooms: { type: DataTypes.INTEGER },
  bathrooms: { type: DataTypes.DECIMAL(3, 1) },
  lastSaleDate: { type: DataTypes.DATE },
  lastSalePrice: { type: DataTypes.DECIMAL(12, 2) },
  zoningCode: { type: DataTypes.STRING },
  aiAnalysis: { type: DataTypes.JSONB }
});

module.exports = PropertyRecord;

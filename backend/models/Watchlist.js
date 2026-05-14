const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Watchlist = sequelize.define('Watchlist', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  entityName: { type: DataTypes.STRING, allowNull: false },
  entityType: { type: DataTypes.ENUM('person', 'business', 'property', 'general'), defaultValue: 'general' },
  notes: { type: DataTypes.TEXT },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
  lastChecked: { type: DataTypes.DATE },
  checkResult: { type: DataTypes.TEXT },
});

module.exports = Watchlist;

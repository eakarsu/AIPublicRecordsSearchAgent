const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AiResult = sequelize.define('AiResult', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: true },
  endpoint: { type: DataTypes.STRING(200), allowNull: false },
  inputData: { type: DataTypes.JSONB },
  result: { type: DataTypes.TEXT },
});

module.exports = AiResult;

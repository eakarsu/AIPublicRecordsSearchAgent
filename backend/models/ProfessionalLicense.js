const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProfessionalLicense = sequelize.define('ProfessionalLicense', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  licenseNumber: { type: DataTypes.STRING, allowNull: false },
  licenseType: { type: DataTypes.STRING, allowNull: false },
  holderName: { type: DataTypes.STRING, allowNull: false },
  profession: { type: DataTypes.STRING, allowNull: false },
  issuingAuthority: { type: DataTypes.STRING },
  state: { type: DataTypes.STRING },
  issueDate: { type: DataTypes.DATE },
  expirationDate: { type: DataTypes.DATE },
  status: { type: DataTypes.ENUM('active', 'expired', 'suspended', 'revoked', 'pending_renewal'), defaultValue: 'active' },
  disciplinaryActions: { type: DataTypes.JSONB, defaultValue: [] },
  specializations: { type: DataTypes.JSONB, defaultValue: [] },
  address: { type: DataTypes.STRING },
  aiAnalysis: { type: DataTypes.JSONB }
});

module.exports = ProfessionalLicense;

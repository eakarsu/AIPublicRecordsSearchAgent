const sequelize = require('../config/database');
const User = require('./User');
const FoiaRequest = require('./FoiaRequest');
const TitleSearch = require('./TitleSearch');
const RegulatoryFiling = require('./RegulatoryFiling');
const CourtRecord = require('./CourtRecord');
const PropertyRecord = require('./PropertyRecord');
const BusinessFiling = require('./BusinessFiling');
const BuildingPermit = require('./BuildingPermit');
const VitalRecord = require('./VitalRecord');
const TaxLien = require('./TaxLien');
const EnvironmentalRecord = require('./EnvironmentalRecord');
const CampaignFinance = require('./CampaignFinance');
const ProfessionalLicense = require('./ProfessionalLicense');
const GovernmentContract = require('./GovernmentContract');

module.exports = {
  sequelize,
  User,
  FoiaRequest,
  TitleSearch,
  RegulatoryFiling,
  CourtRecord,
  PropertyRecord,
  BusinessFiling,
  BuildingPermit,
  VitalRecord,
  TaxLien,
  EnvironmentalRecord,
  CampaignFinance,
  ProfessionalLicense,
  GovernmentContract
};

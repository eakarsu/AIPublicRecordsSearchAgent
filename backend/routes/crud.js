const express = require('express');
const auth = require('../middleware/auth');
const models = require('../models');
const router = express.Router();

// Generic CRUD factory
function createCrudRoutes(modelName, Model) {
  const path = `/${modelName.toLowerCase()}`;

  // Get all
  router.get(path, auth, async (req, res) => {
    try {
      const items = await Model.findAll({ order: [['createdAt', 'DESC']] });
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get one
  router.get(`${path}/:id`, auth, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create
  router.post(path, auth, async (req, res) => {
    try {
      const item = await Model.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Update
  router.put(`${path}/:id`, auth, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      await item.update(req.body);
      res.json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Delete
  router.delete(`${path}/:id`, auth, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      await item.destroy();
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// Create routes for all models
createCrudRoutes('foiarequests', models.FoiaRequest);
createCrudRoutes('titlesearches', models.TitleSearch);
createCrudRoutes('regulatoryfilings', models.RegulatoryFiling);
createCrudRoutes('courtrecords', models.CourtRecord);
createCrudRoutes('propertyrecords', models.PropertyRecord);
createCrudRoutes('businessfilings', models.BusinessFiling);
createCrudRoutes('buildingpermits', models.BuildingPermit);
createCrudRoutes('vitalrecords', models.VitalRecord);
createCrudRoutes('taxliens', models.TaxLien);
createCrudRoutes('environmentalrecords', models.EnvironmentalRecord);
createCrudRoutes('campaignfinance', models.CampaignFinance);
createCrudRoutes('professionallicenses', models.ProfessionalLicense);
createCrudRoutes('governmentcontracts', models.GovernmentContract);

module.exports = router;

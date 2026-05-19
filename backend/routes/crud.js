const express = require('express');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');
const models = require('../models');
const router = express.Router();

// Generic CRUD factory with pagination, search, sort
function createCrudRoutes(modelName, Model) {
  const path = `/${modelName.toLowerCase()}`;

  // Get all - with pagination, search, sort
  router.get(path, auth, async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, parseInt(req.query.limit) || 20);
      const offset = (page - 1) * limit;
      const search = req.query.search || '';
      const sortField = req.query.sort || 'createdAt';
      const sortDir = req.query.dir === 'asc' ? 'ASC' : 'DESC';

      let where = {};
      if (search) {
        // Full-text search across all string fields
        const stringFields = Object.entries(Model.rawAttributes)
          .filter(([, attr]) => attr.type && attr.type.key === 'STRING' || attr.type?.key === 'TEXT')
          .map(([k]) => k);
        if (stringFields.length > 0) {
          where = {
            [Op.or]: stringFields.map(f => ({
              [f]: { [Op.iLike]: `%${search}%` },
            })),
          };
        }
      }

      const { count, rows } = await Model.findAndCountAll({
        where,
        order: [[sortField, sortDir]],
        limit,
        offset,
      });

      res.json({
        data: rows,
        pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
      });
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

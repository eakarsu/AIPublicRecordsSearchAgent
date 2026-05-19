const express = require('express');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { body, validationResult } = require('express-validator');
const models = require('../models');
const router = express.Router();

// Shared OpenRouter caller
async function callOpenRouter(prompt, systemPrompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
      'X-Title': 'AI Public Records Search Agent',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3-5-sonnet-20241022',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.5,
    }),
  });
  if (!response.ok) throw new Error(`OpenRouter API error: ${response.status}`);
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
}

// GET /api/watchlists
router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const { count, rows } = await models.Watchlist.findAndCountAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/watchlists
router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('entityName').trim().notEmpty().withMessage('Entity name is required'),
  body('entityType').optional().isIn(['person', 'business', 'property', 'general']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { name, entityName, entityType, notes } = req.body;
    const item = await models.Watchlist.create({
      userId: req.user.id,
      name,
      entityName,
      entityType: entityType || 'general',
      notes,
    });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/watchlists/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await models.Watchlist.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/watchlists/:id/check - search all records for entity, AI synthesizes update
router.post('/:id/check', auth, aiRateLimiter, async (req, res) => {
  try {
    const watchlist = await models.Watchlist.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!watchlist) return res.status(404).json({ error: 'Not found' });

    const searchTerm = `%${watchlist.entityName}%`;
    const [court, business, taxlien, contract] = await Promise.all([
      models.CourtRecord.findAll({ where: { [Op.or]: [{ plaintiff: { [Op.iLike]: searchTerm } }, { defendant: { [Op.iLike]: searchTerm } }] }, limit: 5 }),
      models.BusinessFiling.findAll({ where: { businessName: { [Op.iLike]: searchTerm } }, limit: 5 }),
      models.TaxLien.findAll({ where: { debtorName: { [Op.iLike]: searchTerm } }, limit: 5 }).catch(() => []),
      models.GovernmentContract.findAll({ where: { vendorName: { [Op.iLike]: searchTerm } }, limit: 5 }).catch(() => []),
    ]);

    const records = { court, business, taxlien, contract };
    const totalFound = Object.values(records).reduce((s, arr) => s + arr.length, 0);

    const summary = Object.entries(records)
      .filter(([, arr]) => arr.length > 0)
      .map(([type, arr]) => `${type}: ${arr.length} records found`)
      .join(', ');

    const checkResult = await callOpenRouter(
      `Watchlist check for entity: "${watchlist.entityName}"\nEntity type: ${watchlist.entityType}\n\nNew records found: ${summary || 'No new records'}\n\nRecords: ${JSON.stringify(records)}\n\nSummarize any significant new findings or changes for this entity. Flag any concerning developments.`,
      'You are a public records monitoring analyst. Summarize watchlist check results concisely.'
    );

    await watchlist.update({ lastChecked: new Date(), checkResult });
    res.json({ checkResult, records, totalFound });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

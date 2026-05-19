// Custom Views routes for AIPublicRecordsSearchAgent
// 4 endpoints: 2 VIZ + 2 NON-VIZ + health
const express = require('express');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const router = express.Router();

// In-memory storage for source rules (jurisdiction allowlist)
let SOURCE_RULES = [
  { id: 1, jurisdiction: 'California', sourceType: 'CourtRecord', allowed: true, priority: 1, notes: 'Statewide superior courts' },
  { id: 2, jurisdiction: 'New York', sourceType: 'PropertyRecord', allowed: true, priority: 2, notes: 'NYC ACRIS integrated' },
  { id: 3, jurisdiction: 'Texas', sourceType: 'BusinessFiling', allowed: true, priority: 1, notes: 'SOS direct feed' },
  { id: 4, jurisdiction: 'Florida', sourceType: 'BuildingPermit', allowed: true, priority: 3, notes: 'County aggregator' },
  { id: 5, jurisdiction: 'Illinois', sourceType: 'TaxLien', allowed: false, priority: 4, notes: 'Currently blocked - data quality' },
];
let RULE_NEXT_ID = 6;

// Mock search history for VIZ endpoints
function generateMockSearchHistory() {
  const queries = ['Smith John', 'property 123 main', 'LLC California', 'tax lien Cook County', 'building permit Austin',
                   'court case 2025', 'business filing Delaware', 'environmental violation', 'campaign finance Q3', 'professional license MD'];
  const sources = ['CourtRecord', 'PropertyRecord', 'BusinessFiling', 'BuildingPermit', 'VitalRecord',
                   'TaxLien', 'EnvironmentalRecord', 'CampaignFinance', 'ProfessionalLicense', 'GovernmentContract'];
  const recordTypes = ['Person', 'Property', 'Business', 'Permit', 'License', 'Filing'];
  const history = [];
  const now = Date.now();
  for (let i = 0; i < 180; i++) {
    history.push({
      query: queries[i % queries.length],
      source: sources[i % sources.length],
      recordType: recordTypes[i % recordTypes.length],
      timestamp: new Date(now - i * 3600 * 1000).toISOString(),
      resultCount: Math.floor(Math.random() * 50) + 1,
    });
  }
  return history;
}

const SEARCH_HISTORY = generateMockSearchHistory();

// Rate limiter using ipKeyGenerator helper
const cvLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  keyGenerator: (req) => req.user?.id ? `user_${req.user.id}` : ipKeyGenerator(req),
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(cvLimiter);

// Health
router.get('/', (req, res) => {
  res.json({
    ok: true,
    feature: 'custom-views',
    project: 'AIPublicRecordsSearchAgent',
    endpoints: ['/query-frequency', '/source-heatmap', '/results-pdf', '/source-rules'],
  });
});

// VIZ 1: Search query frequency chart (time-series buckets by day)
router.get('/query-frequency', (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 7, 30);
    const buckets = {};
    const now = Date.now();
    for (let i = 0; i < days; i++) {
      const d = new Date(now - i * 86400000).toISOString().slice(0, 10);
      buckets[d] = { date: d, count: 0, topQueries: {} };
    }
    SEARCH_HISTORY.forEach((h) => {
      const d = h.timestamp.slice(0, 10);
      if (buckets[d]) {
        buckets[d].count += 1;
        buckets[d].topQueries[h.query] = (buckets[d].topQueries[h.query] || 0) + 1;
      }
    });
    const series = Object.values(buckets)
      .map((b) => ({
        date: b.date,
        count: b.count,
        topQuery: Object.entries(b.topQueries).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    const total = series.reduce((s, x) => s + x.count, 0);
    const peak = series.reduce((m, x) => (x.count > m.count ? x : m), { count: 0, date: null });
    res.json({ ok: true, days, total, peak, series });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// VIZ 2: Source/record-type heatmap
router.get('/source-heatmap', (req, res) => {
  try {
    const sources = Array.from(new Set(SEARCH_HISTORY.map((h) => h.source)));
    const recordTypes = Array.from(new Set(SEARCH_HISTORY.map((h) => h.recordType)));
    const matrix = sources.map((src) => ({
      source: src,
      cells: recordTypes.map((rt) => {
        const matching = SEARCH_HISTORY.filter((h) => h.source === src && h.recordType === rt);
        return {
          recordType: rt,
          count: matching.length,
          avgResults: matching.length
            ? Math.round(matching.reduce((s, x) => s + x.resultCount, 0) / matching.length)
            : 0,
        };
      }),
    }));
    let max = 0;
    matrix.forEach((row) => row.cells.forEach((c) => { if (c.count > max) max = c.count; }));
    res.json({ ok: true, sources, recordTypes, max, matrix });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// NON-VIZ 1: Search results PDF (returns minimal PDF as base64)
router.post('/results-pdf', (req, res) => {
  try {
    const { query, results } = req.body || {};
    const items = Array.isArray(results) ? results : [];
    const title = `Public Records Search Report: ${query || 'Untitled'}`;
    const lines = [title, `Generated: ${new Date().toISOString()}`, `Total results: ${items.length}`, ''];
    items.slice(0, 25).forEach((r, i) => {
      const summary = typeof r === 'string' ? r : (r.summary || r.title || JSON.stringify(r).slice(0, 80));
      lines.push(`${i + 1}. ${summary}`);
    });

    // Minimal PDF generation
    const escape = (s) => String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    let content = 'BT\n/F1 11 Tf\n50 780 Td\n14 TL\n';
    lines.forEach((ln, idx) => {
      content += `(${escape(ln.slice(0, 95))}) Tj\nT*\n`;
    });
    content += 'ET';
    const objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    ];
    let pdf = '%PDF-1.4\n';
    const offsets = [];
    objects.forEach((obj, i) => {
      offsets.push(pdf.length);
      pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
    });
    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.forEach((o) => { pdf += `${String(o).padStart(10, '0')} 00000 n \n`; });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    const base64 = Buffer.from(pdf, 'binary').toString('base64');
    res.json({
      ok: true,
      filename: `search-${(query || 'results').replace(/[^a-z0-9]/gi, '-').slice(0, 30)}.pdf`,
      mimeType: 'application/pdf',
      sizeBytes: pdf.length,
      base64,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// NON-VIZ 2: Source rules editor - CRUD jurisdiction allowlist
router.get('/source-rules', (req, res) => {
  res.json({ ok: true, count: SOURCE_RULES.length, rules: SOURCE_RULES });
});

router.post('/source-rules', (req, res) => {
  try {
    const { jurisdiction, sourceType, allowed, priority, notes } = req.body || {};
    if (!jurisdiction || !sourceType) {
      return res.status(400).json({ ok: false, error: 'jurisdiction and sourceType required' });
    }
    const rule = {
      id: RULE_NEXT_ID++,
      jurisdiction: String(jurisdiction),
      sourceType: String(sourceType),
      allowed: allowed !== false,
      priority: parseInt(priority) || 5,
      notes: notes || '',
    };
    SOURCE_RULES.push(rule);
    res.json({ ok: true, rule });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.put('/source-rules/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = SOURCE_RULES.findIndex((r) => r.id === id);
  if (idx < 0) return res.status(404).json({ ok: false, error: 'Rule not found' });
  const { jurisdiction, sourceType, allowed, priority, notes } = req.body || {};
  if (jurisdiction != null) SOURCE_RULES[idx].jurisdiction = String(jurisdiction);
  if (sourceType != null) SOURCE_RULES[idx].sourceType = String(sourceType);
  if (allowed != null) SOURCE_RULES[idx].allowed = !!allowed;
  if (priority != null) SOURCE_RULES[idx].priority = parseInt(priority);
  if (notes != null) SOURCE_RULES[idx].notes = String(notes);
  res.json({ ok: true, rule: SOURCE_RULES[idx] });
});

router.delete('/source-rules/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const before = SOURCE_RULES.length;
  SOURCE_RULES = SOURCE_RULES.filter((r) => r.id !== id);
  if (SOURCE_RULES.length === before) {
    return res.status(404).json({ ok: false, error: 'Rule not found' });
  }
  res.json({ ok: true, removed: id, remaining: SOURCE_RULES.length });
});

module.exports = router;

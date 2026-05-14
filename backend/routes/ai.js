const express = require('express');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { body, validationResult } = require('express-validator');
const models = require('../models');
const router = express.Router();

// 3-strategy JSON parser
function parseAIJson(text) {
  try { return JSON.parse(text); } catch {}
  try {
    const stripped = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(stripped);
  } catch {}
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) return JSON.parse(text.slice(start, end + 1));
  } catch {}
  return null;
}

// Shared OpenRouter caller
async function callOpenRouter(prompt, systemPrompt) {
  const model = 'anthropic/claude-3-5-sonnet-20241022';
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
      'X-Title': 'AI Public Records Search Agent',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${err}`);
  }
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || 'OpenRouter API error');
  return { choices: data.choices, model: data.model, usage: data.usage };
}

// Persist AI result
async function persistResult(userId, endpoint, inputData, result) {
  try {
    await models.AiResult.create({
      userId: userId || null,
      endpoint,
      inputData,
      result: typeof result === 'string' ? result : JSON.stringify(result),
    });
  } catch (err) {
    console.error('Failed to persist AI result:', err.message);
  }
}

// FOIA Request AI Analysis
router.post('/analyze/foia', auth, aiRateLimiter, async (req, res) => {
  try {
    const { title, agency, description } = req.body;
    const result = await callOpenRouter(
      `Analyze this FOIA request:\nTitle: ${title}\nAgency: ${agency}\nDescription: ${description}\n\nProvide: 1) Likelihood of approval (percentage) 2) Estimated response time 3) Potential exemptions that may apply 4) Recommendations for improving the request 5) Similar successful FOIA requests 6) Key legal precedents`,
      'You are an expert FOIA analyst and public records specialist. Provide detailed, actionable analysis in a structured format.'
    );
    const analysis = result.choices[0].message.content;
    await persistResult(req.user?.id, 'analyze/foia', { title, agency }, analysis);
    res.json({ analysis, model: result.model, usage: result.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Title Search AI Analysis
router.post('/analyze/title', auth, aiRateLimiter, async (req, res) => {
  try {
    const { propertyAddress, county, state, ownerName } = req.body;
    const result = await callOpenRouter(
      `Analyze this property title search:\nAddress: ${propertyAddress}\nCounty: ${county}\nState: ${state}\nOwner: ${ownerName}\n\nProvide: 1) Title risk assessment 2) Common issues for this area 3) Recommended searches to perform 4) Potential liens to check 5) Estimated title insurance cost 6) Chain of title recommendations`,
      'You are a title search expert and real estate attorney. Provide comprehensive title analysis.'
    );
    const analysis = result.choices[0].message.content;
    await persistResult(req.user?.id, 'analyze/title', { propertyAddress, county, state }, analysis);
    res.json({ analysis, model: result.model, usage: result.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Regulatory Filing AI Analysis
router.post('/analyze/regulatory', auth, aiRateLimiter, async (req, res) => {
  try {
    const { filingType, entityName, regulatoryBody, description } = req.body;
    const result = await callOpenRouter(
      `Analyze this regulatory filing:\nType: ${filingType}\nEntity: ${entityName}\nBody: ${regulatoryBody}\nDescription: ${description}\n\nProvide: 1) Compliance assessment 2) Risk factors 3) Required supporting documents 4) Deadline considerations 5) Similar filings outcomes 6) Regulatory trends`,
      'You are a regulatory compliance expert. Provide thorough compliance and filing analysis.'
    );
    const analysis = result.choices[0].message.content;
    await persistResult(req.user?.id, 'analyze/regulatory', { entityName, filingType }, analysis);
    res.json({ analysis, model: result.model, usage: result.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Court Record AI Analysis
router.post('/analyze/court', auth, aiRateLimiter, async (req, res) => {
  try {
    const { caseTitle, court, caseType, plaintiff, defendant, description } = req.body;
    const result = await callOpenRouter(
      `Analyze this court record:\nCase: ${caseTitle}\nCourt: ${court}\nType: ${caseType}\nPlaintiff: ${plaintiff}\nDefendant: ${defendant}\nDescription: ${description}\n\nProvide: 1) Case strength assessment 2) Likely outcomes based on similar cases 3) Key legal issues 4) Estimated timeline 5) Settlement probability 6) Strategic recommendations`,
      'You are a legal research expert and litigation analyst. Provide detailed case analysis.'
    );
    const analysis = result.choices[0].message.content;
    await persistResult(req.user?.id, 'analyze/court', { caseTitle, caseType }, analysis);
    res.json({ analysis, model: result.model, usage: result.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Property Record AI Analysis
router.post('/analyze/property', auth, aiRateLimiter, async (req, res) => {
  try {
    const { address, city, state, propertyType, assessedValue, marketValue } = req.body;
    const result = await callOpenRouter(
      `Analyze this property record:\nAddress: ${address}, ${city}, ${state}\nType: ${propertyType}\nAssessed Value: $${assessedValue}\nMarket Value: $${marketValue}\n\nProvide: 1) Property valuation analysis 2) Market trends for area 3) Tax assessment fairness 4) Investment potential 5) Comparable properties analysis 6) Risk factors`,
      'You are a real estate analyst and property valuation expert. Provide comprehensive property analysis.'
    );
    const analysis = result.choices[0].message.content;
    await persistResult(req.user?.id, 'analyze/property', { address, city, state }, analysis);
    res.json({ analysis, model: result.model, usage: result.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Business Filing AI Analysis
router.post('/analyze/business', auth, aiRateLimiter, async (req, res) => {
  try {
    const { businessName, entityType, stateOfIncorporation, industry } = req.body;
    const result = await callOpenRouter(
      `Analyze this business filing:\nBusiness: ${businessName}\nType: ${entityType}\nState: ${stateOfIncorporation}\nIndustry: ${industry}\n\nProvide: 1) Business entity assessment 2) Compliance requirements 3) Industry-specific regulations 4) Filing obligations 5) Risk indicators 6) Due diligence recommendations`,
      'You are a business compliance and corporate filing expert. Provide thorough business analysis.'
    );
    const analysis = result.choices[0].message.content;
    await persistResult(req.user?.id, 'analyze/business', { businessName, entityType }, analysis);
    res.json({ analysis, model: result.model, usage: result.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Building Permit AI Analysis
router.post('/analyze/permit', auth, aiRateLimiter, async (req, res) => {
  try {
    const { permitType, propertyAddress, description, estimatedCost } = req.body;
    const result = await callOpenRouter(
      `Analyze this building permit:\nType: ${permitType}\nAddress: ${propertyAddress}\nDescription: ${description}\nEstimated Cost: $${estimatedCost}\n\nProvide: 1) Permit approval likelihood 2) Code compliance issues 3) Required inspections 4) Timeline estimate 5) Cost analysis 6) Common issues to watch for`,
      'You are a building code and permit specialist. Provide detailed permit analysis.'
    );
    const analysis = result.choices[0].message.content;
    await persistResult(req.user?.id, 'analyze/permit', { permitType, propertyAddress }, analysis);
    res.json({ analysis, model: result.model, usage: result.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Vital Record AI Analysis
router.post('/analyze/vital', auth, aiRateLimiter, async (req, res) => {
  try {
    const { recordType, fullName, state } = req.body;
    const result = await callOpenRouter(
      `Analyze vital record search requirements:\nType: ${recordType}\nName: ${fullName}\nState: ${state}\n\nProvide: 1) Required documentation for request 2) Processing timeline by state 3) Associated fees 4) Alternative sources 5) Verification methods 6) Privacy considerations`,
      'You are a vital records specialist and genealogy expert. Provide comprehensive guidance.'
    );
    const analysis = result.choices[0].message.content;
    await persistResult(req.user?.id, 'analyze/vital', { recordType, state }, analysis);
    res.json({ analysis, model: result.model, usage: result.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Tax Lien AI Analysis
router.post('/analyze/taxlien', auth, aiRateLimiter, async (req, res) => {
  try {
    const { lienType, amount, debtorName, jurisdiction } = req.body;
    const result = await callOpenRouter(
      `Analyze this tax lien:\nType: ${lienType}\nAmount: $${amount}\nDebtor: ${debtorName}\nJurisdiction: ${jurisdiction}\n\nProvide: 1) Lien priority assessment 2) Resolution options 3) Timeline for collection 4) Impact on property transfer 5) Negotiation strategies 6) Legal remedies available`,
      'You are a tax lien specialist and financial analyst. Provide detailed lien analysis.'
    );
    const analysis = result.choices[0].message.content;
    await persistResult(req.user?.id, 'analyze/taxlien', { lienType, jurisdiction }, analysis);
    res.json({ analysis, model: result.model, usage: result.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Environmental Record AI Analysis
router.post('/analyze/environmental', auth, aiRateLimiter, async (req, res) => {
  try {
    const { siteName, recordType, contaminants, riskLevel } = req.body;
    const result = await callOpenRouter(
      `Analyze this environmental record:\nSite: ${siteName}\nType: ${recordType}\nContaminants: ${JSON.stringify(contaminants)}\nRisk Level: ${riskLevel}\n\nProvide: 1) Environmental risk assessment 2) Required remediation steps 3) Regulatory compliance status 4) Liability analysis 5) Estimated cleanup timeline 6) Health impact assessment`,
      'You are an environmental compliance expert and remediation specialist. Provide thorough environmental analysis.'
    );
    const analysis = result.choices[0].message.content;
    await persistResult(req.user?.id, 'analyze/environmental', { siteName, riskLevel }, analysis);
    res.json({ analysis, model: result.model, usage: result.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Campaign Finance AI Analysis
router.post('/analyze/campaign', auth, aiRateLimiter, async (req, res) => {
  try {
    const { committeeName, candidateName, amount, filingType } = req.body;
    const result = await callOpenRouter(
      `Analyze this campaign finance record:\nCommittee: ${committeeName}\nCandidate: ${candidateName}\nAmount: $${amount}\nType: ${filingType}\n\nProvide: 1) Contribution pattern analysis 2) Compliance with limits 3) Disclosure requirements 4) Donor network analysis 5) Spending efficiency 6) Regulatory flags`,
      'You are a campaign finance analyst and election law expert. Provide detailed financial analysis.'
    );
    const analysis = result.choices[0].message.content;
    await persistResult(req.user?.id, 'analyze/campaign', { committeeName, candidateName }, analysis);
    res.json({ analysis, model: result.model, usage: result.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Professional License AI Analysis
router.post('/analyze/license', auth, aiRateLimiter, async (req, res) => {
  try {
    const { licenseType, holderName, profession, state } = req.body;
    const result = await callOpenRouter(
      `Analyze this professional license:\nType: ${licenseType}\nHolder: ${holderName}\nProfession: ${profession}\nState: ${state}\n\nProvide: 1) License status verification tips 2) Renewal requirements 3) Continuing education needs 4) Disciplinary history check 5) Interstate reciprocity 6) Scope of practice analysis`,
      'You are a professional licensing expert. Provide comprehensive license analysis.'
    );
    const analysis = result.choices[0].message.content;
    await persistResult(req.user?.id, 'analyze/license', { licenseType, profession, state }, analysis);
    res.json({ analysis, model: result.model, usage: result.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Government Contract AI Analysis
router.post('/analyze/contract', auth, aiRateLimiter, async (req, res) => {
  try {
    const { title, agency, vendorName, contractValue, contractType } = req.body;
    const result = await callOpenRouter(
      `Analyze this government contract:\nTitle: ${title}\nAgency: ${agency}\nVendor: ${vendorName}\nValue: $${contractValue}\nType: ${contractType}\n\nProvide: 1) Contract performance assessment 2) Competitive landscape 3) Compliance requirements 4) Past performance indicators 5) Subcontracting opportunities 6) Risk analysis`,
      'You are a government contracting expert and procurement specialist. Provide thorough contract analysis.'
    );
    const analysis = result.choices[0].message.content;
    await persistResult(req.user?.id, 'analyze/contract', { title, agency, vendorName }, analysis);
    res.json({ analysis, model: result.model, usage: result.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// General AI Search
router.post('/search', auth, aiRateLimiter, async (req, res) => {
  try {
    const { query, category } = req.body;
    const result = await callOpenRouter(
      `Public records search query: "${query}"\nCategory: ${category || 'general'}\n\nProvide: 1) Relevant public record sources 2) Search strategy 3) Key databases to check 4) Estimated results 5) Legal considerations 6) Next steps`,
      'You are an AI public records search specialist with expertise across all government record types. Provide comprehensive search guidance.'
    );
    const analysis = result.choices[0].message.content;
    await persistResult(req.user?.id, 'search', { query, category }, analysis);
    res.json({ analysis, model: result.model, usage: result.usage });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// TRUE Agent Search - queries DB tables based on natural language, returns synthesized results
router.post('/agent-search', auth, aiRateLimiter, [
  body('query').trim().notEmpty().isLength({ max: 1000 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { query } = req.body;
    const safeQuery = query.replace(/['"`;]/g, '');

    // Query all models for relevant records
    const searchTerm = `%${safeQuery.split(' ').slice(0, 3).join('%')}%`;
    const [foiaRecords, courtRecords, businessRecords, propertyRecords, contractRecords] = await Promise.all([
      models.FoiaRequest.findAll({ where: { [Op.or]: [{ title: { [Op.iLike]: searchTerm } }, { agency: { [Op.iLike]: searchTerm } }, { description: { [Op.iLike]: searchTerm } }] }, limit: 5 }),
      models.CourtRecord.findAll({ where: { [Op.or]: [{ caseTitle: { [Op.iLike]: searchTerm } }, { plaintiff: { [Op.iLike]: searchTerm } }, { defendant: { [Op.iLike]: searchTerm } }] }, limit: 5 }),
      models.BusinessFiling.findAll({ where: { [Op.or]: [{ businessName: { [Op.iLike]: searchTerm } }, { industry: { [Op.iLike]: searchTerm } }] }, limit: 5 }),
      models.PropertyRecord.findAll({ where: { [Op.or]: [{ address: { [Op.iLike]: searchTerm } }, { ownerName: { [Op.iLike]: searchTerm } }] }, limit: 5 }),
      models.GovernmentContract.findAll({ where: { [Op.or]: [{ title: { [Op.iLike]: searchTerm } }, { agency: { [Op.iLike]: searchTerm } }, { vendorName: { [Op.iLike]: searchTerm } }] }, limit: 5 }),
    ]);

    const dbContext = [
      foiaRecords.length ? `FOIA Requests (${foiaRecords.length}): ${JSON.stringify(foiaRecords.map(r => ({ id: r.id, title: r.title, agency: r.agency, status: r.status })))}` : '',
      courtRecords.length ? `Court Records (${courtRecords.length}): ${JSON.stringify(courtRecords.map(r => ({ id: r.id, case: r.caseTitle, court: r.court, type: r.caseType })))}` : '',
      businessRecords.length ? `Business Filings (${businessRecords.length}): ${JSON.stringify(businessRecords.map(r => ({ id: r.id, name: r.businessName, type: r.entityType, state: r.stateOfIncorporation })))}` : '',
      propertyRecords.length ? `Property Records (${propertyRecords.length}): ${JSON.stringify(propertyRecords.map(r => ({ id: r.id, address: r.address, owner: r.ownerName, value: r.marketValue })))}` : '',
      contractRecords.length ? `Government Contracts (${contractRecords.length}): ${JSON.stringify(contractRecords.map(r => ({ id: r.id, title: r.title, agency: r.agency, vendor: r.vendorName, value: r.contractValue })))}` : '',
    ].filter(Boolean).join('\n\n');

    const prompt = `User search query: "${safeQuery}"\n\nRelevant database records found:\n${dbContext || 'No specific records found matching the query.'}\n\nSynthesize the above public records to answer the user's query. Provide:\n1. Summary of findings\n2. Key records and their relevance\n3. Patterns or connections across records\n4. Recommendations for further research\n5. Important caveats or limitations`;

    const result = await callOpenRouter(prompt, 'You are an AI public records analyst. Synthesize database records to answer user queries with specific citations to the found records.');
    const analysis = result.choices[0].message.content;
    await persistResult(req.user?.id, 'agent-search', { query: safeQuery }, analysis);

    res.json({
      analysis,
      citations: { foiaRecords, courtRecords, businessRecords, propertyRecords, contractRecords },
      model: result.model,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// FOIA Letter Generator
router.post('/foia-letter', auth, aiRateLimiter, [
  body('agency').trim().notEmpty(),
  body('subject').trim().notEmpty(),
  body('requestorName').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { agency, subject, requestorName, requestorEmail, requestorAddress, specificRecords, dateRange } = req.body;
    const result = await callOpenRouter(
      `Generate a complete, professional FOIA request letter with these details:\nAgency: ${agency}\nSubject/Records Requested: ${subject}\nRequestor Name: ${requestorName}\nRequestor Email: ${requestorEmail || 'N/A'}\nRequestor Address: ${requestorAddress || 'N/A'}\nSpecific Records: ${specificRecords || 'All related records'}\nDate Range: ${dateRange || 'All available dates'}\n\nGenerate a complete FOIA letter following all legal requirements including:\n- Proper legal citation to FOIA statute (5 U.S.C. § 552)\n- Clear description of requested records\n- Request for fee waiver if applicable\n- 20-day response deadline reminder\n- Request for documents in electronic format\n- Contact information`,
      'You are a FOIA specialist attorney. Generate a complete, legally-sound FOIA request letter. Output only the letter text, formatted for immediate use.'
    );
    const letter = result.choices[0].message.content;
    await persistResult(req.user?.id, 'foia-letter', { agency, subject, requestorName }, letter);
    res.json({ letter, model: result.model });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Cross-record entity linking - search all models for a name/business
router.post('/entity-link', auth, aiRateLimiter, [
  body('entityName').trim().notEmpty().isLength({ max: 200 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { entityName } = req.body;
    const searchTerm = `%${entityName}%`;
    const safeEntity = entityName.replace(/['"`;]/g, '');

    // Search across all 13 models
    const [foia, court, property, business, permit, vital, taxlien, env, campaign, license, contract, regulatory, title] = await Promise.all([
      models.FoiaRequest.findAll({ where: { [Op.or]: [{ requestorName: { [Op.iLike]: searchTerm } }, { agency: { [Op.iLike]: searchTerm } }] }, limit: 5 }),
      models.CourtRecord.findAll({ where: { [Op.or]: [{ plaintiff: { [Op.iLike]: searchTerm } }, { defendant: { [Op.iLike]: searchTerm } }] }, limit: 5 }),
      models.PropertyRecord.findAll({ where: { ownerName: { [Op.iLike]: searchTerm } }, limit: 5 }),
      models.BusinessFiling.findAll({ where: { businessName: { [Op.iLike]: searchTerm } }, limit: 5 }),
      models.BuildingPermit.findAll({ where: { [Op.or]: [{ applicantName: { [Op.iLike]: searchTerm } }, { propertyAddress: { [Op.iLike]: searchTerm } }] }, limit: 5 }).catch(() => []),
      models.VitalRecord.findAll({ where: { fullName: { [Op.iLike]: searchTerm } }, limit: 5 }).catch(() => []),
      models.TaxLien.findAll({ where: { debtorName: { [Op.iLike]: searchTerm } }, limit: 5 }).catch(() => []),
      models.EnvironmentalRecord.findAll({ where: { siteName: { [Op.iLike]: searchTerm } }, limit: 5 }).catch(() => []),
      models.CampaignFinance.findAll({ where: { [Op.or]: [{ candidateName: { [Op.iLike]: searchTerm } }, { committeeName: { [Op.iLike]: searchTerm } }] }, limit: 5 }),
      models.ProfessionalLicense.findAll({ where: { holderName: { [Op.iLike]: searchTerm } }, limit: 5 }).catch(() => []),
      models.GovernmentContract.findAll({ where: { vendorName: { [Op.iLike]: searchTerm } }, limit: 5 }).catch(() => []),
      models.RegulatoryFiling.findAll({ where: { entityName: { [Op.iLike]: searchTerm } }, limit: 5 }).catch(() => []),
      models.TitleSearch.findAll({ where: { ownerName: { [Op.iLike]: searchTerm } }, limit: 5 }).catch(() => []),
    ]);

    const allRecords = { foia, court, property, business, permit, vital, taxlien, environmental: env, campaign, license, contract, regulatory, title };
    const totalFound = Object.values(allRecords).reduce((s, arr) => s + arr.length, 0);

    const recordSummary = Object.entries(allRecords)
      .filter(([, arr]) => arr.length > 0)
      .map(([type, arr]) => `${type} (${arr.length} records): ${JSON.stringify(arr.slice(0, 2))}`)
      .join('\n');

    const result = await callOpenRouter(
      `Synthesize all public records found for entity: "${safeEntity}"\n\nTotal records found: ${totalFound}\n\nRecords by category:\n${recordSummary || 'No records found.'}\n\nCreate a comprehensive risk profile and entity analysis including:\n1. Entity overview and known associations\n2. Legal history (court records, regulatory issues)\n3. Financial risk indicators (tax liens, contract value)\n4. Property holdings\n5. Business relationships\n6. Overall risk assessment (Low/Medium/High) with justification`,
      'You are a public records intelligence analyst. Synthesize cross-domain records into a comprehensive entity risk profile.'
    );
    const analysis = result.choices[0].message.content;
    await persistResult(req.user?.id, 'entity-link', { entityName: safeEntity, totalFound }, analysis);
    res.json({ analysis, records: allRecords, totalFound, model: result.model });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/timeline-reconstruction — chronological narrative across an entity's records
router.post('/timeline-reconstruction', auth, aiRateLimiter, [
  body('entityName').trim().notEmpty().isLength({ max: 200 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { entityName } = req.body;
    const searchTerm = `%${entityName}%`;
    const safeEntity = entityName.replace(/['"`;]/g, '');

    const [foia, court, property, business, permit, vital, taxlien, env, campaign, license, contract, regulatory, title] = await Promise.all([
      models.FoiaRequest.findAll({ where: { [Op.or]: [{ requestorName: { [Op.iLike]: searchTerm } }, { agency: { [Op.iLike]: searchTerm } }] }, limit: 25 }).catch(() => []),
      models.CourtRecord.findAll({ where: { [Op.or]: [{ plaintiff: { [Op.iLike]: searchTerm } }, { defendant: { [Op.iLike]: searchTerm } }] }, limit: 25 }).catch(() => []),
      models.PropertyRecord.findAll({ where: { ownerName: { [Op.iLike]: searchTerm } }, limit: 25 }).catch(() => []),
      models.BusinessFiling.findAll({ where: { businessName: { [Op.iLike]: searchTerm } }, limit: 25 }).catch(() => []),
      models.BuildingPermit.findAll({ where: { [Op.or]: [{ applicantName: { [Op.iLike]: searchTerm } }, { propertyAddress: { [Op.iLike]: searchTerm } }] }, limit: 25 }).catch(() => []),
      models.VitalRecord.findAll({ where: { fullName: { [Op.iLike]: searchTerm } }, limit: 25 }).catch(() => []),
      models.TaxLien.findAll({ where: { debtorName: { [Op.iLike]: searchTerm } }, limit: 25 }).catch(() => []),
      models.EnvironmentalRecord.findAll({ where: { siteName: { [Op.iLike]: searchTerm } }, limit: 25 }).catch(() => []),
      models.CampaignFinance.findAll({ where: { [Op.or]: [{ candidateName: { [Op.iLike]: searchTerm } }, { committeeName: { [Op.iLike]: searchTerm } }] }, limit: 25 }).catch(() => []),
      models.ProfessionalLicense.findAll({ where: { holderName: { [Op.iLike]: searchTerm } }, limit: 25 }).catch(() => []),
      models.GovernmentContract.findAll({ where: { vendorName: { [Op.iLike]: searchTerm } }, limit: 25 }).catch(() => []),
      models.RegulatoryFiling.findAll({ where: { entityName: { [Op.iLike]: searchTerm } }, limit: 25 }).catch(() => []),
      models.TitleSearch.findAll({ where: { ownerName: { [Op.iLike]: searchTerm } }, limit: 25 }).catch(() => []),
    ]);

    const all = { foia, court, property, business, permit, vital, taxlien, environmental: env, campaign, license, contract, regulatory, title };
    const totalFound = Object.values(all).reduce((s, arr) => s + arr.length, 0);

    const flat = Object.entries(all)
      .flatMap(([type, arr]) => arr.map(r => ({ type, record: r.toJSON ? r.toJSON() : r })));

    const result = await callOpenRouter(
      `Reconstruct a chronological narrative for entity: "${safeEntity}".

Records (${totalFound} total):
${JSON.stringify(flat).slice(0, 12000)}

Return JSON only:
{
  "timeline": [{"date": "YYYY-MM-DD", "type": "string", "summary": "string", "source_record_id": "string"}],
  "narrative_chapters": [{"period": "string", "headline": "string", "summary": "string"}],
  "gaps": [{"period": "string", "what_is_missing": "string"}],
  "anomalies": [{"date": "YYYY-MM-DD", "anomaly": "string"}],
  "summary": "string"
}`,
      'You are a public-records timeline analyst. Be conservative; do not invent dates or facts. Return JSON only.'
    );
    const analysis = result.choices[0].message.content;
    await persistResult(req.user?.id, 'timeline-reconstruction', { entityName: safeEntity, totalFound }, analysis);
    res.json({ analysis, totalFound, model: result.model });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/contradiction-detection — find inconsistencies across an entity's records
router.post('/contradiction-detection', auth, aiRateLimiter, [
  body('entityName').trim().notEmpty().isLength({ max: 200 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { entityName } = req.body;
    const searchTerm = `%${entityName}%`;
    const safeEntity = entityName.replace(/['"`;]/g, '');

    const [court, property, business, taxlien, license, contract, regulatory] = await Promise.all([
      models.CourtRecord.findAll({ where: { [Op.or]: [{ plaintiff: { [Op.iLike]: searchTerm } }, { defendant: { [Op.iLike]: searchTerm } }] }, limit: 25 }).catch(() => []),
      models.PropertyRecord.findAll({ where: { ownerName: { [Op.iLike]: searchTerm } }, limit: 25 }).catch(() => []),
      models.BusinessFiling.findAll({ where: { businessName: { [Op.iLike]: searchTerm } }, limit: 25 }).catch(() => []),
      models.TaxLien.findAll({ where: { debtorName: { [Op.iLike]: searchTerm } }, limit: 25 }).catch(() => []),
      models.ProfessionalLicense.findAll({ where: { holderName: { [Op.iLike]: searchTerm } }, limit: 25 }).catch(() => []),
      models.GovernmentContract.findAll({ where: { vendorName: { [Op.iLike]: searchTerm } }, limit: 25 }).catch(() => []),
      models.RegulatoryFiling.findAll({ where: { entityName: { [Op.iLike]: searchTerm } }, limit: 25 }).catch(() => []),
    ]);

    const all = { court, property, business, taxlien, license, contract, regulatory };
    const totalFound = Object.values(all).reduce((s, arr) => s + arr.length, 0);

    const result = await callOpenRouter(
      `Find contradictions and inconsistencies in records for entity: "${safeEntity}".

Records (${totalFound} total):
${JSON.stringify(all).slice(0, 12000)}

Return JSON only:
{
  "contradictions": [{"summary": "string", "evidence": [{"source": "string", "record_id": "string", "claim": "string"}], "severity": "low|medium|high", "possible_explanations": ["string"]}],
  "consistency_score": 0,
  "verification_recommendations": ["string"],
  "summary": "string"
}`,
      'You are a fact-checking AI. Surface only contradictions actually supported by the records. Return JSON only.'
    );
    const analysis = result.choices[0].message.content;
    await persistResult(req.user?.id, 'contradiction-detection', { entityName: safeEntity, totalFound }, analysis);
    res.json({ analysis, totalFound, model: result.model });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

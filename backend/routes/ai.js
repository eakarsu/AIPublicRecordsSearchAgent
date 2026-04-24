const express = require('express');
const https = require('https');
const auth = require('../middleware/auth');
const router = express.Router();

function callOpenRouter(prompt, systemPrompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Public Records Search Agent'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.error) {
            reject(new Error(parsed.error.message || 'OpenRouter API error'));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error('Failed to parse OpenRouter response'));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// FOIA Request AI Analysis
router.post('/analyze/foia', auth, async (req, res) => {
  try {
    const { title, agency, description } = req.body;
    const result = await callOpenRouter(
      `Analyze this FOIA request:\nTitle: ${title}\nAgency: ${agency}\nDescription: ${description}\n\nProvide: 1) Likelihood of approval (percentage) 2) Estimated response time 3) Potential exemptions that may apply 4) Recommendations for improving the request 5) Similar successful FOIA requests 6) Key legal precedents`,
      'You are an expert FOIA analyst and public records specialist. Provide detailed, actionable analysis in a structured format.'
    );
    res.json({ analysis: result.choices[0].message.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Title Search AI Analysis
router.post('/analyze/title', auth, async (req, res) => {
  try {
    const { propertyAddress, county, state, ownerName } = req.body;
    const result = await callOpenRouter(
      `Analyze this property title search:\nAddress: ${propertyAddress}\nCounty: ${county}\nState: ${state}\nOwner: ${ownerName}\n\nProvide: 1) Title risk assessment 2) Common issues for this area 3) Recommended searches to perform 4) Potential liens to check 5) Estimated title insurance cost 6) Chain of title recommendations`,
      'You are a title search expert and real estate attorney. Provide comprehensive title analysis.'
    );
    res.json({ analysis: result.choices[0].message.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Regulatory Filing AI Analysis
router.post('/analyze/regulatory', auth, async (req, res) => {
  try {
    const { filingType, entityName, regulatoryBody, description } = req.body;
    const result = await callOpenRouter(
      `Analyze this regulatory filing:\nType: ${filingType}\nEntity: ${entityName}\nBody: ${regulatoryBody}\nDescription: ${description}\n\nProvide: 1) Compliance assessment 2) Risk factors 3) Required supporting documents 4) Deadline considerations 5) Similar filings outcomes 6) Regulatory trends`,
      'You are a regulatory compliance expert. Provide thorough compliance and filing analysis.'
    );
    res.json({ analysis: result.choices[0].message.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Court Record AI Analysis
router.post('/analyze/court', auth, async (req, res) => {
  try {
    const { caseTitle, court, caseType, plaintiff, defendant, description } = req.body;
    const result = await callOpenRouter(
      `Analyze this court record:\nCase: ${caseTitle}\nCourt: ${court}\nType: ${caseType}\nPlaintiff: ${plaintiff}\nDefendant: ${defendant}\nDescription: ${description}\n\nProvide: 1) Case strength assessment 2) Likely outcomes based on similar cases 3) Key legal issues 4) Estimated timeline 5) Settlement probability 6) Strategic recommendations`,
      'You are a legal research expert and litigation analyst. Provide detailed case analysis.'
    );
    res.json({ analysis: result.choices[0].message.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Property Record AI Analysis
router.post('/analyze/property', auth, async (req, res) => {
  try {
    const { address, city, state, propertyType, assessedValue, marketValue } = req.body;
    const result = await callOpenRouter(
      `Analyze this property record:\nAddress: ${address}, ${city}, ${state}\nType: ${propertyType}\nAssessed Value: $${assessedValue}\nMarket Value: $${marketValue}\n\nProvide: 1) Property valuation analysis 2) Market trends for area 3) Tax assessment fairness 4) Investment potential 5) Comparable properties analysis 6) Risk factors`,
      'You are a real estate analyst and property valuation expert. Provide comprehensive property analysis.'
    );
    res.json({ analysis: result.choices[0].message.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Business Filing AI Analysis
router.post('/analyze/business', auth, async (req, res) => {
  try {
    const { businessName, entityType, stateOfIncorporation, industry } = req.body;
    const result = await callOpenRouter(
      `Analyze this business filing:\nBusiness: ${businessName}\nType: ${entityType}\nState: ${stateOfIncorporation}\nIndustry: ${industry}\n\nProvide: 1) Business entity assessment 2) Compliance requirements 3) Industry-specific regulations 4) Filing obligations 5) Risk indicators 6) Due diligence recommendations`,
      'You are a business compliance and corporate filing expert. Provide thorough business analysis.'
    );
    res.json({ analysis: result.choices[0].message.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Building Permit AI Analysis
router.post('/analyze/permit', auth, async (req, res) => {
  try {
    const { permitType, propertyAddress, description, estimatedCost } = req.body;
    const result = await callOpenRouter(
      `Analyze this building permit:\nType: ${permitType}\nAddress: ${propertyAddress}\nDescription: ${description}\nEstimated Cost: $${estimatedCost}\n\nProvide: 1) Permit approval likelihood 2) Code compliance issues 3) Required inspections 4) Timeline estimate 5) Cost analysis 6) Common issues to watch for`,
      'You are a building code and permit specialist. Provide detailed permit analysis.'
    );
    res.json({ analysis: result.choices[0].message.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vital Record AI Analysis
router.post('/analyze/vital', auth, async (req, res) => {
  try {
    const { recordType, fullName, state } = req.body;
    const result = await callOpenRouter(
      `Analyze vital record search requirements:\nType: ${recordType}\nName: ${fullName}\nState: ${state}\n\nProvide: 1) Required documentation for request 2) Processing timeline by state 3) Associated fees 4) Alternative sources 5) Verification methods 6) Privacy considerations`,
      'You are a vital records specialist and genealogy expert. Provide comprehensive guidance.'
    );
    res.json({ analysis: result.choices[0].message.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tax Lien AI Analysis
router.post('/analyze/taxlien', auth, async (req, res) => {
  try {
    const { lienType, amount, debtorName, jurisdiction } = req.body;
    const result = await callOpenRouter(
      `Analyze this tax lien:\nType: ${lienType}\nAmount: $${amount}\nDebtor: ${debtorName}\nJurisdiction: ${jurisdiction}\n\nProvide: 1) Lien priority assessment 2) Resolution options 3) Timeline for collection 4) Impact on property transfer 5) Negotiation strategies 6) Legal remedies available`,
      'You are a tax lien specialist and financial analyst. Provide detailed lien analysis.'
    );
    res.json({ analysis: result.choices[0].message.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Environmental Record AI Analysis
router.post('/analyze/environmental', auth, async (req, res) => {
  try {
    const { siteName, recordType, contaminants, riskLevel } = req.body;
    const result = await callOpenRouter(
      `Analyze this environmental record:\nSite: ${siteName}\nType: ${recordType}\nContaminants: ${JSON.stringify(contaminants)}\nRisk Level: ${riskLevel}\n\nProvide: 1) Environmental risk assessment 2) Required remediation steps 3) Regulatory compliance status 4) Liability analysis 5) Estimated cleanup timeline 6) Health impact assessment`,
      'You are an environmental compliance expert and remediation specialist. Provide thorough environmental analysis.'
    );
    res.json({ analysis: result.choices[0].message.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Campaign Finance AI Analysis
router.post('/analyze/campaign', auth, async (req, res) => {
  try {
    const { committeeName, candidateName, amount, filingType } = req.body;
    const result = await callOpenRouter(
      `Analyze this campaign finance record:\nCommittee: ${committeeName}\nCandidate: ${candidateName}\nAmount: $${amount}\nType: ${filingType}\n\nProvide: 1) Contribution pattern analysis 2) Compliance with limits 3) Disclosure requirements 4) Donor network analysis 5) Spending efficiency 6) Regulatory flags`,
      'You are a campaign finance analyst and election law expert. Provide detailed financial analysis.'
    );
    res.json({ analysis: result.choices[0].message.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Professional License AI Analysis
router.post('/analyze/license', auth, async (req, res) => {
  try {
    const { licenseType, holderName, profession, state } = req.body;
    const result = await callOpenRouter(
      `Analyze this professional license:\nType: ${licenseType}\nHolder: ${holderName}\nProfession: ${profession}\nState: ${state}\n\nProvide: 1) License status verification tips 2) Renewal requirements 3) Continuing education needs 4) Disciplinary history check 5) Interstate reciprocity 6) Scope of practice analysis`,
      'You are a professional licensing expert. Provide comprehensive license analysis.'
    );
    res.json({ analysis: result.choices[0].message.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Government Contract AI Analysis
router.post('/analyze/contract', auth, async (req, res) => {
  try {
    const { title, agency, vendorName, contractValue, contractType } = req.body;
    const result = await callOpenRouter(
      `Analyze this government contract:\nTitle: ${title}\nAgency: ${agency}\nVendor: ${vendorName}\nValue: $${contractValue}\nType: ${contractType}\n\nProvide: 1) Contract performance assessment 2) Competitive landscape 3) Compliance requirements 4) Past performance indicators 5) Subcontracting opportunities 6) Risk analysis`,
      'You are a government contracting expert and procurement specialist. Provide thorough contract analysis.'
    );
    res.json({ analysis: result.choices[0].message.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// General AI Search
router.post('/search', auth, async (req, res) => {
  try {
    const { query, category } = req.body;
    const result = await callOpenRouter(
      `Public records search query: "${query}"\nCategory: ${category || 'general'}\n\nProvide: 1) Relevant public record sources 2) Search strategy 3) Key databases to check 4) Estimated results 5) Legal considerations 6) Next steps`,
      'You are an AI public records search specialist with expertise across all government record types. Provide comprehensive search guidance.'
    );
    res.json({ analysis: result.choices[0].message.content, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

# Audit Note — AIPublicRecordsSearchAgent

Source: `/Users/erolakarsu/projects/_AUDIT/reports/batch_07.md` section #6.

## Original Recommendations

### Gaps — AI Counterparts
- `/document-ocr`
- `/person-network-map`
- `/timeline-reconstruction` (added)
- `/contradiction-detection` (added)

### Gaps — Non-AI Features
- Saved-search alerts
- Bulk download/export
- External data source integrations (court dockets, tax APIs)
- FOIA deadline tracking
- Workspace/org management

### Custom Feature Suggestions
1. Entity resolution & graph
2. Litigation timeline
3. Property ownership chain
4. Regulatory compliance history
5. FOIA checklist
6. Watchlist alert feed

## Implemented (Mechanical)
- `POST /api/ai/timeline-reconstruction` — added in `backend/routes/ai.js`. Pulls 13 record types for an entity, returns timeline, narrative chapters, gaps, anomalies. Persists via existing `persistResult`.
- `POST /api/ai/contradiction-detection` — added in `backend/routes/ai.js`. Surfaces contradictions across court, property, business, taxlien, license, contract, regulatory records with evidence and severity.

Both follow existing `callOpenRouter`/`auth`/`aiRateLimiter`/`persistResult` style.

## Backlog (deferred)

### NEEDS-CREDS / NEW-DEPS
- `/document-ocr` — needs OCR backend (Tesseract, AWS Textract, Google Vision).
- External data feed integration (court dockets APIs, county property APIs, IRS).
- FOIA deadline/cron tracking.

### NEEDS-PRODUCT-DECISION
- `/person-network-map` — graph data model + visualization payload.
- Workspace / org schema.
- Saved search alerts (delivery channels).

### TOO-RISKY
- Background watchlist daemon (cron + alert routing).
- Bulk export at scale (rate-limit / cost concerns).

## Apply pass 3 (frontend)

LEFT-AS-IS — frontend already wires all backend AI endpoints (JWT Bearer from localStorage, existing styling, backend error surfaced verbatim including 503-no-key). No FE changes required by idempotence rule. See `_AUDIT/apply3_logs/ab3_57.md` for endpoint inventory.

## Apply pass 4 (mechanical backlog)

SKIPPED — no MECHANICAL backlog remaining. All deferred items are NEEDS-CREDS (`/document-ocr` requires OCR service; external court/property/IRS feeds; FOIA cron), NEEDS-PRODUCT-DECISION (`/person-network-map` graph schema; workspace/org model; saved-search alert delivery), or TOO-RISKY (background watchlist daemon, bulk export at scale).

# Governed public-record answer

The durable path is `/api/governed-record-answers`. Bearer identity plus active tenant membership are required; every write also requires `X-Tenant-Id` and `Idempotency-Key`. The workflow records versioned permissioned sources, resumable ingestion, parsing/chunking/deduplication, indexing and deletion propagation, retrieval traces, grounded citations, abstention-ready review, human disposition, and export. Evidence stores opaque encrypted references, versions, SHA-256 digests, timestamps, consent basis, and non-sensitive metadata rather than raw sensitive content.

The additive migration `backend/migrations/001_governed_record_answer.sql` is an explicit operator action. Startup never creates, drops, seeds, synchronizes, or migrates a database. Apply it only through an approved migrator after backup, review, and rollback planning. It adds tenant memberships, optimistic case versions, immutable evidence/events, retention metadata, and connector-failure receipts without deleting legacy tables.

Typed connectors are intentionally unconfigured. Generated, gap, direct-provider, and untrusted-execution routes are quarantined by default; their enablement flag is forbidden in production, and credentials do not establish provider fitness. Production adapters still need credentials, contract tests, webhook verification, retries/backoff, reconciliation, privacy/security review, and usage controls.

Versioned acceptance fixtures exercise complete and unsafe/missing inputs, deterministic metrics, stale data where applicable, RBAC, dual control, optimistic concurrency, provider failure, migration safety, and launcher safety. No records repository, object store, OCR/parser, search index, agency API, FOIA/ticketing, retrieval dataset, records-officer, privacy, or legal validation was performed.

Copy `.env.example` to secret-managed `.env`, replace placeholders, and leave legacy/demo/untrusted flags false. Run `node --test backend/governance/*.test.cjs`, syntax checks, and `bash -n start.sh`. The launcher starts only already-installed code, refuses occupied ports, and stops only its own children. Dependencies, provisioning, migrations, seed data, external systems, and real-world acceptance remain separate approved operations.


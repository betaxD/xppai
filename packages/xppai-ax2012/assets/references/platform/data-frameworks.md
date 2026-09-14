# Data Frameworks and Database Semantics

Baseline: Microsoft Dynamics AX 2012 R3

Capability: supported for explain, architect, risk, codefix, and dev.

## Scope

Cover surrogate and replacement keys, table inheritance, valid-time-state tables and queries, TempDB temporary tables, UnitOfWork, computed view columns, relations, indexes, delete actions, database synchronization, data-loss risk, framework-owned tables, installation-local RecId values, and supported mutation APIs.

Number sequence analysis includes scoped references, company/organization context, allocation timing, continuous-sequence behavior, transaction and rollback implications, batch/concurrency risks, and supported framework APIs. Do not hardcode identifiers or allocate numbers speculatively inside loops.

## Evidence required

- Table/query/view metadata, inheritance hierarchy, keys, relations, indexes, delete actions, valid-time-state mode, and affected row counts.
- Model/layer, effective top-layer implementation, xRef/callers, data ownership, existing customizations, and application/kernel build.
- Proposed schema delta, generated synchronization SQL when available, data conversion/backfill, validation queries, backup, rollback, and acceptable outage.
- For TempDB and UnitOfWork, actual host/tier, transaction boundaries, object lifecycle, and CIL execution mode.
- For number sequences, reference, scope, organization/company, continuous flag, transaction timing, retry/idempotency behavior, and concurrency test.

## Decision rules

Field removal or type changes, index/relation changes, table-inheritance changes, and synchronization that can drop or transform data require explicit data assessment, backup, validation queries, and rollback before production-ready guidance.

Treat RecId as installation-local evidence, not a portable cross-environment identifier. Preserve framework invariants and use supported APIs instead of directly mutating framework-owned state. Validate delete actions and transaction rollback on both success and failure paths.

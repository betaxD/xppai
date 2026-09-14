# Ledger Posting

Baseline: Microsoft Dynamics AX 2012 R3

Capability: gated for explain, architect, risk, codefix, and dev by the document-flow and posting evidence below.

## Scope

Treat FormLetter orchestration and source-document accounting as distinct, non-universal flows. Do not imply every FormLetter path uses source documents or accounting distributions identically.

The FormLetter route covers Sales and Purchase document statuses; parm tables/data; query and selection; controllers and services; partial, pro forma, batch, intercompany, charges, tax, inventory, commitment/budget, and print-management behavior when applicable; posting profiles; vouchers/journals; side effects; and fragile sequencing.

The source-document accounting route covers only document types proven to use that framework: accounting distributions, dimension defaulting, subledger entries and posting-profile counterentries, transfer to general ledger, supported framework APIs, and validation points.

## Evidence required

- Exact document type/status, entry point, controller/service/FormLetter classes, source-document participation, parm records, query/selection, and effective posting profile.
- Company, partition, identity, layer/model, top-layer implementations, xRef/callers, handlers/subscribers, transaction scope, and retry/batch behavior.
- Financial dimensions, tax, charges, inventory/trade, intercompany, commitment/budget, print-management, and regional dependencies that the concrete flow touches.
- Before/after vouchers, journals, distributions, subledger transfer, inventory state, infolog/exceptions, and rollback/reconciliation evidence.

## Decision rules

Follow the framework service for the exact R3 document flow. Production-ready guidance prohibits direct insert/update/delete of posted journals, vouchers, `InventTrans`, `AccountingDistribution`, dimension-combination tables, or other framework-owned/posted tables.

Preserve transaction ownership and validation order. A partial, batch, pro forma, or intercompany path is not proven by a successful simple interactive posting. Keep root cause and production readiness `Unknown` until the affected flow and side effects are evidenced.

# Financial Dimensions

Baseline: Microsoft Dynamics AX 2012 R3

Capability: supported through standard dimension framework APIs for explain, architect, risk, codefix, and dev.

## Scope

Cover main accounts, account structures, account combinations, `DefaultDimension` versus `LedgerDimension`, `DimensionAttribute`, values, value sets, combinations, defaulting, merging, validation, accounting distributions, source-document/subledger relationships, company context, and chart-of-accounts dependencies.

`DefaultDimension` represents default financial-dimension values; `LedgerDimension` represents a ledger account combination including the main account. They are not interchangeable identifiers. Resolve and validate combinations with standard framework APIs and the effective legal-entity/account-structure context.

## Evidence required

- The source and destination fields, expected dimension semantics, company, ledger, chart of accounts, account structures, advanced rules, and active dimension configuration.
- Existing framework calls, defaulting/merge order, validation errors, effective values, and relevant source-document or accounting-distribution records.
- Model/layer, xRef/callers, batch/AIF/SysOperation context, application/kernel build, and representative posting regression cases.
- When posting is involved, the `business.ledger-posting` reference and its execution, transaction, inventory/trade, and document-flow gates.

## Decision rules

Do not perform direct writes to framework-owned dimension value-set or combination tables. Do not treat RecId values as portable between environments. Preserve company and account-structure context and use framework APIs for construction, defaulting, merging, persistence, and validation.

Any posting path that reads, defaults, changes, distributes, validates, or persists dimensions is not production-ready until both financial-dimension and ledger-posting evidence gates pass.

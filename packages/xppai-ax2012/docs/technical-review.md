# AX 2012 R3 Technical Review

Status: **Approved by human AX 2012 R3 specialist**

This record is the first-public-release technical checkpoint for `xppai-ax2012`. Passing the automated script is necessary, but it is not a substitute for review and approval by a human AX 2012 R3 expert. Do not publish while any acceptance row or signature field remains incomplete, or when the decision is `REJECT`.

## Review scope

The reviewer determines:

- whether an AX 2009-only rule was incorrectly carried into AX 2012 R3;
- whether an R3 execution, framework, security, model, posting, or AIF rule is inaccurate;
- whether an essential R3 domain is incorrectly deferred;
- whether the reference boundaries and routing produce safe implementation guidance;
- whether the package boundary preserves AX 2009 and keeps install, cache, ownership, and artifact behavior independent.

## Capability decision table

| Reference | Status | Review decision and release constraint |
| --- | --- | --- |
| `platform.model-store` | Supported | Confirm model/layer, effective implementation, build, CIL, topology, and deployment evidence. |
| `platform.xpp-language` | Supported | Confirm R3 syntax, event-handler, CLR, tier, identity, company, partition, transaction, and CIL rules. |
| `platform.sysoperation` | Supported | Confirm controller, contract, service, UI builder, menu item, batch, security, and CIL guidance. |
| `platform.aif` | Supported | Confirm service type, WCF, integration-port, adapter, authorization, activation, refresh, failure-path, and CIL guidance. |
| `platform.security` | Supported | Confirm roles, duties, privileges, entry points, XDS, Code Access Security, effective identity, and deployment checks. |
| `platform.data-frameworks` | Supported | Confirm valid-time state, table inheritance, TempDB, UnitOfWork, delete actions, RecId limits, and number-sequence rules. |
| `business.financial-dimensions` | Supported | Confirm dimension structures, combinations, defaults, distributions, validation, storage, framework ownership, and regression coverage. |
| `business.ledger-posting` | Gated | Permit implementation guidance only after the exact document flow, posting framework, dimensions, tax, configuration, builds, ownership, regression, and rollback evidence pass. |
| `business.inventory-trade` | Supported | Confirm transaction origin/state, reservation, on-hand, costing, settlement, posting, dimensions, and framework-owned mutation boundaries. |
| `business.retail` | Gated | Permit implementation guidance only after installed-component, license/configuration, topology, build/CU/hotfix, channel/store, schema, job, payload, and environment evidence pass. |
| `business.workflow-ssrs` | Deferred | Limit output to preliminary explanation, artifact inventory, and an explicit gap report; no production-ready codefix or development guidance. |
| `business.regionalization` | Gated | Require country/region, model/layer, configuration-key, metadata, guarded-path, dependency, scope, and unaffected-region evidence. |

## Evidence gates

For every scenario, record the supplied synthetic evidence and verify that absent facts remain `Unknown`. Production-ready guidance requires the exact applicable subset of: object and call graph; business contract and acceptance criteria; model and layer; effective top-layer implementation; application and kernel builds; CU and hotfix context; company and partition; execution host and identity; topology and AOS count; configuration and metadata; security; CIL, deployment, and synchronization state; data ownership and transaction behavior; representative fixtures; expected side effects; regression cases; rollback; and external contracts.

Reject incompatible AX 2009 or D365 implementation artifacts. Do not use Chain of Command, D365 extension classes, or AX 2009 rules as R3 implementation guidance. Pre/post handlers are evaluated by their actual signatures and runtime constraints; neither handler type is a universal replacement strategy.

## Deferred domains

The initial release defers profiler/stack analysis, symptom-first support, organization model and global address book, DIXF/DMF, production-ready Workflow/SSRS guidance, broader Retail/Commerce, WHS, TMS, XPO/model export generation, and deterministic Babysit orchestration. A deferred request must produce only the supported preliminary inventory and gap behavior until a separately reviewed capability promotion is made.

## Automated check before manual review

From `packages/xppai-ax2012/`:

```powershell
npm ci
node scripts/verify-technical-review.js --automated-only
npm test
npm run verify:artifact
npm run verify:side-by-side
npm run verify:ax2009
```

The `--automated-only` command validates the published guidance contracts without claiming human approval. Preserve its output with the review evidence.

## Manual first-release acceptance flows

Use synthetic AX 2012 R3 evidence only. Invoke the stated route, confirm the loaded references and gate behavior, then replace both reviewer placeholders in that row. `Observed result` must describe the route and safety behavior actually observed. `Unknowns` must list concrete unresolved facts or exactly `None`.

| Scenario | Route | References | Evidence gate | Expected outcome | Observed result | Unknowns |
| --- | --- | --- | --- | --- | --- | --- |
| Explain an existing SysOperation | `explain` | `platform.sysoperation`, `platform.xpp-language` | Supply controller, contract, service, menu item, execution mode, call evidence, build, model/layer, and CIL context. | Explain the evidenced flow; label missing runtime facts `Unknown`; do not invent implementation details. | PASS — the reviewer confirmed that the route loaded the expected references, explained only evidenced behavior, and preserved absent runtime facts as `Unknown`. | None |
| Develop a complete SysOperation | `dev` | `platform.sysoperation`, `platform.xpp-language`, `platform.security`, `platform.model-store` | Supply behavior, acceptance criteria, naming authority, code tag, model/layer, execution and security context, builds, CU/hotfix, topology, compile/CIL, and tests. | Produce a complete R3 pattern only when all gates pass; otherwise return preliminary architecture and the next required evidence. | PASS — the reviewer confirmed that the `dev` route enforced its evidence gates and limited its output to the evidence supplied. | None |
| Explain an AIF integration | `explain` | `platform.aif`, `platform.security` | Supply service type, contract, port/adapter, WSDL or discovery, activation, authorization, company/partition, failure evidence, builds, and CIL state. | Explain only the evidenced integration path and preserve absent payload, identity, activation, or failure details as `Unknown`. | PASS — the reviewer confirmed that the route loaded the AIF and security references, explained the evidenced path, and preserved absent facts as `Unknown`. | None |
| Develop an AIF service | `dev` | `platform.aif`, `platform.security`, `platform.xpp-language`, `platform.model-store` | Supply behavior, contract and payload, authorization, port/deployment context, model/layer, build/CU/hotfix, topology, CIL, failure cases, and acceptance tests. | Produce R3 service guidance only after gates pass; require discovery, activation/refresh, non-admin authorization, context, failure-path, and CIL verification. | PASS — the reviewer confirmed that the route enforced the AIF service, security, deployment, failure-path, and CIL evidence gates. | None |
| Correct a handler bug | `codefix` | `platform.xpp-language` | Supply publisher and handler code, signature, event type, arguments/return behavior, call evidence, tier, transaction, CIL, exception, subscriber, build, and model/layer context. | Distinguish the local bug from a design or deployment gap; propose a focused R3 fix without relying on subscriber order or incompatible constructs. | PASS — the reviewer confirmed that the route distinguished the local defect from design and deployment gaps and avoided unsupported handler assumptions. | None |
| Assess a model/deployment change | `risk` | `platform.model-store` | Supply artifacts, dependencies, model/layer, effective top layer, application/kernel build, CU/hotfix, topology, compile/BP/CIL, synchronization, data, deployment, validation, and rollback evidence. | Score unresolved evidence as risk; identify affected deployment playbook steps and block unsafe or unqualified production guidance. | PASS — the reviewer confirmed that the route scored unresolved evidence as risk and blocked unsafe or unqualified deployment guidance. | None |
| Detect an incompatible-version artifact | `Papai` then `intake` rejection | None; reject before domain loading | Supply an artifact whose identity or constructs prove AX 2009 or D365 rather than AX 2012 R3. | Reject the baseline conflict without mutation, cache contamination, fallback routing, or implementation advice. | PASS — the reviewer confirmed that Papai and intake rejected the incompatible artifact before domain loading or cache mutation. | None |
| Install AX 2009 and AX 2012 side by side | package CLI and target adapters | None; use ownership and preservation contracts | Install both products with AX 2009 and user sentinels, upgrade AX 2012, retire one owned AX 2012 skill, test rollback, and compare root assets, cache, and sentinels byte-for-byte. | AX 2012 owns and changes only its declared files; AX 2009 and user-owned files remain unchanged in copy and symlink modes. | PASS — the reviewer confirmed that copy and symlink flows changed only declared AX 2012 files and preserved AX 2009 and user-owned sentinels. | None |

## Reviewer signature

Replace every value below with an exact human record. `APPROVE` clears the full gate. `REJECT` records the review decision but deliberately keeps the release gate blocked until the findings are resolved and a new review is signed.

- Reviewer name: Roberta Freitas
- Review date: 2026-09-15
- Application build: Unknown — not recorded at reviewer direction
- Kernel build: Unknown — not recorded at reviewer direction
- CU and hotfix context: Unknown — not recorded at reviewer direction
- Decision: APPROVE

## Final command sequence

After all eight rows and signature fields are complete, run from `packages/xppai-ax2012/` and retain the output with the signed record:

```powershell
npm run verify:technical-review
npm test
npm run verify:artifact
npm run verify:side-by-side
npm run verify:ax2009
```

All commands must pass before this gate may be committed or used as publication evidence.

# xppAI AX 2012 R3 — Architecture

**Status:** Approved architecture v1 — synchronized with the reviewed implementation plan
**Date:** 2026-09-08
**Scope:** Architecture contract. Implementation begins only through an explicit execution request against the reviewed plan.

## 1. Objective

Add Microsoft Dynamics AX 2012 R3 support to the xppAI repository without changing or semantically mixing the existing AX 2009 suite.

The AX 2012 implementation will be a separate npm package and CLI inside this repository. It will use an explicit namespace, an independent cache, an independent release lifecycle, and an AX 2012 R3-specific knowledge baseline.

The main orchestration model remains Papai. Public specialist skills can also be invoked directly.

## 2. Decisions Already Accepted

- Microsoft Dynamics AX 2012 R3 is the only runtime baseline.
- The new implementation is a separate npm package and CLI.
- The package lives inside the current repository.
- The existing AX 2009 package stays at the repository root.
- The first implementation uses a self-contained package, with no shared runtime kernel.
- `xppai-ax2012-papai` is the primary orchestrator.
- Public specialists remain directly callable as skills.
- Skills are separated primarily by user intent, not by every AX framework.
- Framework knowledge is stored in internal reference packs and loaded on demand.
- `codefix` is for existing defective behavior.
- `dev` is for implementing new behavior and new artifacts.
- `packages/xppai-ax2012/assets/` is the only authoritative AX 2012 asset tree.
- AX 2012 installation ownership is recorded in a package-specific manifest.
- AX 2012 cache identity is validated by schema and product metadata, not only by directory name.
- Financial dimensions are part of the initial knowledge scope because posting depends on them.
- Runtime evidence is modeled across host, execution engine, identity, partition, company, security, transaction, and deployment artifact.
- Application build, kernel build, CU, and relevant hotfixes qualify the R3 baseline for production-ready guidance.
- XPO is partial evidence and cannot by itself prove effective top-layer behavior, model ownership, subscribers, or installation-portable object IDs.
- New AX 2012 specifications, plans, documentation, source, tests, identifiers, diagnostics, and commit messages are written in English.
- The initial package uses Node.js 18 or newer, CommonJS, built-in Node.js APIs, and no runtime dependencies.
- The initial independently published package version is `0.1.0`.

## 3. Repository Boundary

```text
xppai/
├── package.json                     # existing AX 2009 package
├── assets/                          # existing AX 2009 assets
├── src/                             # existing AX 2009 CLI
├── test/                            # existing AX 2009 tests
│
└── packages/
    └── xppai-ax2012/
        ├── package.json
        ├── README.md
        ├── bin/
        │   └── xppai-ax2012.js
        ├── src/
        ├── assets/
        │   ├── skills/
        │   ├── commands/
        │   └── references/
        │       ├── platform/
        │       ├── business/
        │       └── manifest.json
        ├── docs/
        ├── scripts/
        └── test/
```

The root package will not become an npm workspace during the first implementation. The AX 2012 package will have its own lockfile and will be installed, tested, packed, and published from its own directory. It must not import runtime modules or semantic rules from the AX 2009 package.

Some small Node.js infrastructure may initially be duplicated deliberately. A shared kernel may be considered later only after both packages have stable contracts and isolation tests.

`packages/xppai-ax2012/assets/` is the single authoritative source for AX 2012 skills, commands, agents, and bundled references. The package must not introduce mirror trees such as a second top-level `skills/` or `agents/` directory. A contract test must fail if another apparent AX 2012 source tree is introduced.

The existing divergence between the root `assets/skills/` and `skills/` trees belongs to AX 2009 and is outside this change. AX 2012 work must neither reconcile nor copy that divergence.

## 4. Product Identity and Namespace

| Concern | AX 2009 | AX 2012 R3 |
|---|---|---|
| npm package | `xppai` | `xppai-ax2012` |
| CLI executable | `xppai` | `xppai-ax2012` |
| skill prefix | `xppai-*` | `xppai-ax2012-*` |
| primary orchestrator | `xppai-papai` | `xppai-ax2012-papai` |
| cache namespace | `xppai` | `xppai-ax2012` |
| technical baseline | AX 2009 | AX 2012 R3 |

No AX 2012 skill may reference an unversioned `xppai-*` skill as a dependency or fallback.

## 5. Initial Public Skills

```text
xppai-ax2012-core
xppai-ax2012-intake
xppai-ax2012-papai
xppai-ax2012-explain
xppai-ax2012-architect
xppai-ax2012-risk
xppai-ax2012-codefix
xppai-ax2012-dev
xppai-ax2012-help
```

| Skill | Responsibility |
|---|---|
| `core` | AX 2012 R3 baseline and mandatory rules |
| `intake` | One-time XPO intake and evidence selection |
| `papai` | Orchestration of simple, ambiguous, and multi-domain requests |
| `explain` | Explain existing X++ artifacts and framework behavior |
| `architect` | Review or design component boundaries and interactions |
| `risk` | Assess dependencies, regression surface, and deployment impact |
| `codefix` | Diagnose and correct defective existing behavior |
| `dev` | Implement new behavior and new AX artifacts |
| `help` | Public catalog and usage guidance |

## 6. Internal Domain References

Domain knowledge is not exposed as one public skill per framework. It is stored in the package's canonical reference tree and loaded only when relevant.

```text
assets/references/
├── platform/
│   ├── model-store.md
│   ├── xpp-language.md
│   ├── sysoperation.md
│   ├── aif.md
│   ├── security.md
│   └── data-frameworks.md
├── business/
│   ├── financial-dimensions.md
│   ├── ledger-posting.md
│   ├── inventory-trade.md
│   ├── retail.md
│   ├── workflow-ssrs.md
│   └── regionalization.md
└── manifest.json
```

The core instruction must explicitly state that reference packs are not all loaded by default. Skills resolve references through `assets/references/manifest.json`; no skill owns a private or mirrored reference tree.

Examples:

```text
Explain an existing SysOperation
→ explain + platform.sysoperation

Implement a new SysOperation
→ dev + platform.sysoperation + platform.xpp-language

Assess an AIF authorization failure
→ risk + platform.aif + platform.security

Fix an event handler bug
→ codefix + platform.xpp-language
```

### Reference Manifest

`manifest.json` is the authoritative routing contract for reference packs. Every entry contains:

- stable `id`;
- path relative to `assets/references/`;
- `baseline: "2012-R3"`;
- supported `domains`;
- capability `status`: `supported`, `gated`, or `deferred`.

Manifest validation rejects missing files, invalid baselines, invalid statuses, and empty domain lists. Specialists load the minimum references selected by domain and capability status.

### Rule Coverage and Enforcement

Every accepted AX 2012 R3 review rule must have one authoritative home and at least one enforcement mechanism:

| Kind of rule | Authoritative home | Minimum enforcement |
|---|---|---|
| Cross-cutting invariant | `xppai-ax2012-core/SKILL.md` | skill-contract test or technical-review scan |
| Framework-specific behavior | one reference pack declared by `manifest.json` | manifest and reference-content tests |
| Environment-dependent safety condition | capability matrix or production-readiness gate | negative test proving that missing evidence blocks a definitive claim |
| Deferred or unsupported behavior | capability matrix | routing test proving that the skill returns a gap report instead of invented implementation guidance |

A rule must not be copied into several packs as independent prose. When several domains depend on the same invariant, the secondary pack names the authoritative pack instead of redefining the rule. Skill-contract tests validate routing, manifest reachability, capability status, and the required `Evidence required` section in every initial reference.

### Initial Capability Matrix

| Reference ID | Explain | Architect | Risk | Codefix | Dev | Initial state |
|---|---:|---:|---:|---:|---:|---|
| `platform.model-store` | Yes | Yes | Yes | Yes | Yes | Supported |
| `platform.xpp-language` | Yes | Yes | Yes | Yes | Yes | Supported |
| `platform.sysoperation` | Yes | Yes | Yes | Yes | Yes | Supported |
| `platform.aif` | Yes | Yes | Yes | Yes | Yes | Supported |
| `platform.security` | Yes | Yes | Yes | Yes | Yes | Supported |
| `platform.data-frameworks` | Yes | Yes | Yes | Yes | Yes | Supported |
| `business.financial-dimensions` | Yes | Yes | Yes | Yes | Yes | Supported with standard framework APIs only |
| `business.ledger-posting` | Yes | Yes | Yes | Yes | Yes | Gated by execution, dimensions, inventory/trade, and affected document-flow evidence |
| `business.inventory-trade` | Yes | Yes | Yes | Yes | Yes | Supported for the initial sales, purchase, inventory, and posting scope |
| `business.retail` | Yes | Yes | Yes | Yes, after gate | Yes, after gate | Gated by installed Retail components and configuration evidence |
| `business.workflow-ssrs` | Preliminary only | Preliminary only | Gap report | No | No | Deferred; reference included to define the evidence gap |
| `business.regionalization` | Yes | Yes | Yes | Yes, after gate | Yes, after gate | Gated by explicit country/region, model/layer, configuration-key, and metadata evidence |

Production-ready code is allowed only for a domain whose reference state is `supported`, or for a `gated` domain after the evidence requirements in that pack pass. A deferred domain may receive only preliminary architecture, artifact inventory, and an explicit knowledge-gap report. Including a gated or deferred reference in the initial package does not imply production-ready implementation support.

## 7. Papai Orchestration

`xppai-ax2012-papai` is the main entry point for ambiguous, mixed, or complex work.

```text
request
  → validate R3 baseline
  → classify intent
  → classify domain
  → run XPO intake when applicable
  → load only relevant references
  → invoke the minimum useful skill sequence
  → validate
  → synthesize
```

Canonical Papai routed intents:

- `explain`
- `architect`
- `risk`
- `codefix`
- `dev`

Each routed intent maps directly to the specialist with the same suffix:

```text
explain   → xppai-ax2012-explain
architect → xppai-ax2012-architect
risk      → xppai-ax2012-risk
codefix   → xppai-ax2012-codefix
dev       → xppai-ax2012-dev
```

XPO inspection, prerequisite loading, validation, synthesis, and stopping with missing context are orchestration phases, not additional routed intent names.

Papai uses three investigation cycles as a default cost limit, not as evidence that an investigation is sufficient. One cycle is `inspect evidence → choose action → use skill/tool → validate`; intake and prerequisite loading do not consume independent cycles. If essential evidence is still missing at the limit, Papai returns `Unknown` plus the next required evidence and must not synthesize a positive production-readiness conclusion merely because the counter was exhausted. The user may explicitly authorize deeper investigation.

The canonical `AGENT.md` is packaged with the Papai skill:

```text
assets/skills/xppai-ax2012-papai/
├── SKILL.md
└── AGENT.md
```

## 8. Direct Specialist Invocation

The following skills are directly callable:

- `xppai-ax2012-explain`
- `xppai-ax2012-architect`
- `xppai-ax2012-risk`
- `xppai-ax2012-codefix`
- `xppai-ax2012-dev`

A directly invoked specialist:

1. loads `xppai-ax2012-core`;
2. runs `xppai-ax2012-intake` once when XPO input is present;
3. classifies the relevant domain;
4. loads only the required reference packs;
5. answers within the requested intent;
6. recommends Papai if the request crosses its boundary.

A specialist does not silently invoke another specialist.

## 9. Codefix Versus Dev

### Codefix

`xppai-ax2012-codefix` handles behavior that already exists but is defective, regressed, slow, or incorrect. It requires concrete evidence and seeks the smallest safe change that preserves the intended contract.

### Dev

`xppai-ax2012-dev` handles behavior that does not yet exist or intentionally expands an existing contract. It can create SysOperation controllers, data contracts, services, UI builders, AIF artifacts, integrations, event handlers, batch operations, security artifacts, and other new AX components.

Decision rule:

```text
Restore an existing contract → codefix
Create or expand a contract  → dev
```

For a complex new feature, Papai may use:

```text
architect → dev → risk
```

## 10. Dev Contract

Before generating production-ready implementation code, `dev` requires:

- desired business behavior;
- acceptance criteria;
- target layer and model;
- object names or permission to propose names;
- Tag ID, Project ID, Dev Name, and date;
- execution mode;
- relevant company or partition requirements;
- integration and security requirements;
- AX application version/build and kernel build;
- installed CU and relevant hotfixes, when known;
- topology and number of AOS instances when deployment or CIL is affected.

If required inputs are incomplete, `dev` may provide a preliminary architecture and object inventory, but must not label generated code production-ready.

Required output:

1. Functional summary.
2. Decisions and assumptions.
3. AOT object inventory.
4. Dependencies.
5. AOT location, layer, and model.
6. X++ implementation per object.
7. Attributes and AOT properties.
8. Technical and functional configuration.
9. Entry points and security.
10. Compile, database synchronization, and CIL steps.
11. Deployment and rollback guidance.
12. Tests and validation.
13. Risks and unknowns.

## 11. AX 2012 R3 Core Rules

The core remains small and contains only cross-cutting requirements:

- AX 2012 R3 only.
- Do not provide AX 2009 or D365 implementation guidance.
- Do not use Chain of Command or D365 extension-class patterns.
- Use `Confirmed`, `Likely`, `Hypothesis`, and `Unknown` evidence labels.
- Keep local variable declarations at the beginning of AX 2012 methods.
- Preserve AX 2012 transaction, `ttsLevel`, and `forUpdate` semantics.
- Use the correct `TextIo.status()` pattern.
- Preserve X++ aggregate-result behavior.
- Treat AOT and MorphX as active development concepts.
- Qualify R3 production guidance with application build, kernel build, CU/hotfix evidence, and topology. “R3” alone is not proof of one exact runtime state.
- Classify every relevant entry point by host, execution engine, effective identity, partition, company, security boundary, transaction scope, and deployment artifact.
- Treat AX32 client execution as p-code and batch/service execution as CIL. `Server` does not by itself prove that a path executed in CIL.
- Require every batch/service-reachable path to compile and be tested in CIL and in its real execution mode. Interactive client success is not production-readiness evidence for batch or services.
- Prefer the smallest behavior-preserving change.
- Protect country/region code; do not reuse an AX 2009-only hardcoded tag list as the full AX 2012 policy.
- Require both layer and model context for production-ready changes.
- Check effective top-layer implementations, xRef/callers, overrides, delegates, pre/post handlers, and external subscribers when assessing impact. Missing multi-layer/xRef evidence remains `Unknown`.
- State compile, database synchronization, CIL generation, deployment, and AOS implications when applicable.

## 12. `platform.sysoperation` Reference Scope

`platform/sysoperation.md` covers:

- controllers and entry points;
- data contracts;
- `DataContractAttribute` and `DataMemberAttribute`;
- service classes and operation methods;
- UI builders;
- contract-processing attributes;
- synchronous, asynchronous, and batch execution modes;
- serialization and parameter persistence;
- retry and error handling;
- menu items and security;
- CIL execution;
- controller → contract → service execution flow.

Minimum production-ready pattern:

- contract marked with `DataContractAttribute`;
- serializable parm methods marked with `DataMemberAttribute`;
- service method free of client/UI dependencies and protected with the appropriate `SysEntryPointAttribute`;
- controller configured with the exact service class, method, and execution mode;
- `SysOperationContractProcessingAttribute` and UI builder used only when required;
- Action menu item plus explicit security entry point;
- parameter-persistence compatibility considered when changing existing contracts;
- synchronous, asynchronous, and batch/CIL behavior tested when those modes are supported.

The reference supports explain, architect, risk, codefix, and dev intents.

## 13. `platform.aif` Reference Scope

`platform/aif.md` covers:

- inbound and outbound integration ports;
- custom, document, and system services;
- service groups and operations;
- WCF service hosting on AOS;
- `Axd*` document-service classes;
- schemas and namespaces;
- transformations and XML/non-XML messages;
- synchronous and asynchronous processing;
- queues, batch, history, and exceptions;
- `SysEntryPointAttribute` and authorization;
- company and partition context;
- idempotency, retry, and failure handling;
- deployment, service refresh, and CIL;
- material differences from AX 2009 AIF.

The reference must distinguish:

- basic versus enhanced inbound ports;
- inbound versus outbound processing;
- AOS-hosted intranet services versus Internet exposure routed through IIS/WCF while execution remains on AOS;
- synchronous versus asynchronous pipelines;
- adapter, transform, schema, and activation/refresh responsibilities;
- authenticated transport identity versus AX functional authorization;
- company/partition supplied by call context or explicit contract versus user defaults.

Production-ready validation includes WSDL/service discovery, port activation, service refresh, queue/history/exception behavior where applicable, non-admin/service-account authorization, effective company/partition, and CIL execution.

The reference supports explain, architect, risk, codefix, and dev intents.

## 14. Other Initial Reference Scopes

### `platform.xpp-language`: Runtime, CIL, Eventing, and Execution Context

- X++ attributes;
- delegates and event subscriptions;
- pre/post event handlers;
- `is` and `as` operators;
- .NET interop and proxies;
- client versus AOS execution;
- p-code versus CIL;
- batch and service CIL behavior;
- compile and debugging consequences;
- `Exception::CLRError`, inner-exception inspection, and managed-interop diagnostics;
- Code Access Security and protected APIs such as file/interop operations.

Pre/post handlers are not Chain of Command and have no `next` call. The reference documents supported handler signatures and the appropriate `XppPrePostArgs` accessors for instance, arguments, and return values. It also covers inherited transaction/tier context, CIL compatibility, exception behavior, multiple subscribers, and the prohibition on relying on subscriber order unless the platform contract proves it.

The reference provides one cross-cutting execution model used by SysOperation, AIF, posting, risk, codefix, and dev:

```text
entry point
  → host
  → execution engine
  → effective identity
  → partition
  → company
  → privilege/entry point/XDS/CAS
  → transaction scope
  → deployment artifact
```

`changeCompany` and `crossCompany` operate only across companies in the current partition; they are never presented as a way to cross partitions. Guidance must not hardcode `DAT`, `Initial`, or another default. Batch and service output records effective partition, company, and user/service identity and must not silently fall back to defaults when the contract requires explicit context.

### `platform.model-store`: Model Store and Deployment

- model store;
- layers and models;
- current model;
- separate business and model-store databases in the R3 topology, conventionally the business database plus its `<BusinessDatabase>_model` database;
- `.axmodel` model artifacts and `.axmodelstore` full-store artifacts;
- AxUtil and relevant PowerShell tooling;
- element/model identity;
- installation-local element IDs;
- compilation, synchronization, CIL, deployment, and AOS refresh implications;
- coordinated backup and rollback requirements.

A model belongs to one layer, and each element in a layer belongs to one model. Model and layer are distinct required identities. `.axmodel` transports one model and replaces AOD as the installation artifact; `.axmodelstore` transports a complete model store. XPO remains a granular analysis/interchange artifact and is not treated as semantically equivalent to either model artifact.

Deployment is expressed as playbooks by artifact/change type, not as an unordered checklist. A playbook covers coordinated backups, application/kernel build validation, layer/model/dependency checks, AOS draining/stopping when applicable, import, conflict handling, full compile and best-practice checks, destructive database-synchronization assessment, synchronization, full CIL, restart/refresh of every AOS, and impacted SSRS, Enterprise Portal, assembly, service, and port operations. Rollback must account for both business and model-store databases and for schema/data changes.

### `platform.data-frameworks`: Data Model and Database

`platform/data-frameworks.md` covers:

- surrogate and replacement keys;
- table inheritance;
- valid-time-state tables and queries;
- TempDB temporary tables;
- UnitOfWork;
- computed view columns, relations, indexes, and query behavior;
- database synchronization and data-loss analysis;
- framework-owned tables and supported mutation APIs.

Field removal/type changes, index/relation changes, table-inheritance changes, and synchronization that can drop or transform data require an explicit data assessment, backup, validation query, and rollback plan before production-ready guidance.

### `business.ledger-posting`: Posting

One ledger-posting reference covers both FormLetter orchestration and source-document accounting while preserving them as distinct, non-universal flows.

Its FormLetter section covers:

- Sales and Purchase FormLetter flows by document status;
- parm tables, parm data, query/selection, controllers, and services;
- partial, pro forma, batch, intercompany, charges, tax, inventory, commitment/budget, and print-management scenarios when applicable;
- posting profiles, generated journals/vouchers, side effects, and fragile sequencing.

Its source-document-accounting section covers:

- only document types proven to use the source-document framework;
- accounting distributions and dimension defaulting;
- subledger journal entries, including counterentries created through posting profiles;
- transfer from subledger to general ledger;
- supported framework APIs and validation points.

The skill must not imply that every FormLetter path uses source documents or distributions identically. Production-ready guidance prohibits direct insert/update/delete of posted journals, vouchers, `InventTrans`, `AccountingDistribution`, dimension-combination tables, or other cataloged framework-owned/posted tables. It must use the standard service/framework for the exact R3 document flow.

### `platform.security`: Security and XDS

- roles, duties, and privileges;
- permissions and entry points;
- permission inference as review input, never as a substitute for explicit authorization design;
- segregation of duties;
- extensible data security policies;
- table and field access;
- service-operation authorization;
- linked permissions and `AOSAuthorization` where applicable;
- Code Access Security boundaries for protected APIs;
- least-privilege testing with non-admin users and service/batch accounts.

Every exposed service operation, RDP/server operation, and menu entry point must have the appropriate `SysEntryPointAttribute`, privilege, duty, role assignment, and underlying permissions. Transport authentication does not itself grant AX functional authorization. Permission inference must be reviewed for indirect/dynamic calls and protected tables, and XDS must be tested under the effective non-admin identity.

### `business.financial-dimensions`: Financial Dimensions

- main accounts, account structures, and account combinations;
- `DefaultDimension` versus `LedgerDimension` semantics;
- `DimensionAttribute`, dimension values, value sets, and combinations;
- framework APIs for constructing, defaulting, merging, and validating dimensions;
- accounting distributions and their relationship to source documents and subledger entries;
- company context and chart-of-accounts dependencies;
- prohibition of direct writes to framework-owned dimension-combination tables;
- validation and regression scenarios for posting, AIF, SysOperation, and batch flows that carry dimensions.

Posting that reads, defaults, changes, distributes, validates, or persists financial dimensions is not production-ready unless `business.ledger-posting` and `business.financial-dimensions` are loaded and their evidence gates pass.

### `business.inventory-trade`: Product, Inventory, and Trade

`business/inventory-trade.md` covers the dependencies needed to reason safely about sales, purchase, inventory, and posting flows:

- product, product master, variant, and released-product boundaries;
- product, storage, and tracking dimension groups;
- `InventDim` construction and reuse;
- `InventTrans` ownership and state transitions;
- reservations, marking, on-hand context, and posting side effects;
- sales and purchase order lifecycle evidence;
- costing evidence gates;
- prohibition on direct mutation of framework-owned inventory transaction state.

WHS, TMS, and Commerce remain outside the initial production-ready scope even when they touch inventory. Retail is governed separately by `business.retail`.

### Number Sequences Within `platform.data-frameworks`

The data-frameworks reference covers scoped number-sequence references, company/organization context, allocation timing, continuous-sequence behavior, transaction/rollback implications, batch/concurrency risks, and supported framework APIs. Dev/codefix must not hardcode identifiers or allocate numbers speculatively inside loops.

### `business.retail`: Retail

`business/retail.md` is included in the initial package as a gated reference. It requires evidence of installed Retail components, configuration, channel/store context, model/layer ownership, and the affected transaction flow before codefix or dev can move beyond preliminary guidance. It does not expand the initial scope to Commerce generally.

### `business.workflow-ssrs`: Workflow and SSRS

`business/workflow-ssrs.md` is included to make deferred capability explicit. It supports preliminary explanation, architecture inventory, and gap reporting, but does not authorize production-ready codefix or dev guidance in the initial release. The pack lists the exact workflow or reporting artifacts and environment evidence required for a future capability promotion.

### `business.regionalization`: Regionalization

`business/regionalization.md` is gated by explicit country/region scope, model and layer evidence, configuration keys, metadata, and code guards. A production-ready recommendation must identify the affected regional behavior and may not generalize an AX 2009-only tag list into an AX 2012 policy.

## 15. XPO Intake, Parser, and Cache

Direct local-file intake remains the primary evidence path. Pasted XPO is analyzed directly. CLI cache operations remain optional.

### Parser Contract

The parser uses a versioned top-level object registry instead of treating every `Token #Name` line as an AOT object. The immutable version 1 registry is:

| Raw token or aliases | Canonical type | Required closer |
|---|---|---|
| `CLASS` | `Class` | `ENDCLASS` |
| `TABLE` | `Table` | `ENDTABLE` |
| `FORM` | `Form` | `ENDFORM` |
| `QUERY` | `Query` | `ENDQUERY` |
| `VIEW` | `View` | `ENDVIEW` |
| `MAP` | `Map` | `ENDMAP` |
| `ENUM` | `Enum` | `ENDENUM` |
| `EDT`, `EDTEXT`, `DATATYPE` | `ExtendedDataType` | `ENDEDT` |
| `JOB` | `Job` | `ENDJOB` |
| `PROJECT` | `Project` | `ENDPROJECT` |
| `SERVICE` | `Service` | `ENDSERVICE` |
| `SERVICEGROUP` | `ServiceGroup` | `ENDSERVICEGROUP` |
| `SECURITYROLE` | `SecurityRole` | `ENDSECURITYROLE` |
| `SECURITYDUTY` | `SecurityDuty` | `ENDSECURITYDUTY` |
| `SECURITYPRIVILEGE` | `SecurityPrivilege` | `ENDSECURITYPRIVILEGE` |
| `SECURITYPOLICY` | `SecurityPolicy` | `ENDSECURITYPOLICY` |

Every version 1 entry uses the `required-closer` completeness policy and permits a new object only at a column-zero boundary between top-level objects. `SOURCE` is a legal nested header and never starts a top-level object. Each registered type defines:

- raw top-level tokens and aliases;
- canonical type;
- valid start-boundary rules;
- known closer, when one exists;
- completeness policy;
- whether nested `SOURCE #...` and other section headers are legal inside it.

Parsing has two stages. A scanner records header candidates and offsets. A classifier promotes a candidate to an AOT object only when its token is registered and the current structural boundary permits a new top-level object. Internal headers such as `SOURCE #methodName` remain part of their owning object.

An unregistered candidate is retained as an unclassified raw fragment with completeness `indeterminate`; it is never silently promoted to an object. Adding support for a new top-level type requires a registry entry and a realistic synthetic fixture.

Object and file completeness use exactly three states:

- `complete` — all required structural boundaries are confirmed;
- `incomplete` — a required boundary is provably missing;
- `indeterminate` — the registry cannot prove either state.

Both file and stdin intake run the same completeness validation. The parser reads the source as bytes, records encoding/BOM information, hashes the original bytes, and retains byte offsets plus decoded line/character offsets. Parsed object content is a slice of the original source; newline normalization must not change the evidence hash.

Each object records at least:

- `rawType`, `canonicalType`, `name`, and `rawHeader`;
- byte and decoded-source offsets;
- original content hash;
- completeness state and reason;
- explicit layer/model metadata when present;
- provenance for all inferred metadata.

Model, layer, build, effective top-layer implementation, external subscribers, and cross-reference results remain `Unknown` unless the artifact or an additional evidence source proves them.

Numeric object IDs are installation-specific evidence and are not used as stable cross-environment identity. Stable comparison uses canonical type, name, hierarchy, and content. XPO does not replace `.axmodel`, `.axmodelstore`, xRef, model-store metadata, or a multi-layer view of the effective element.

Baseline evidence is recorded in order of strength:

1. explicit application/kernel build and model-store metadata;
2. exclusive or incompatible language/framework constructs;
3. user-declared baseline and environment context;
4. otherwise `Unknown`.

The cache stores declared and inferred baseline separately, together with confidence and provenance. Invocation through the AX 2012 CLI sets an expected baseline; it does not falsely convert an unprovable XPO into confirmed R3 evidence.

### Cache Identity

The default Windows locations are separate from AX 2009:

```text
%LOCALAPPDATA%/xppai-ax2012/config.json
%LOCALAPPDATA%/xppai-ax2012/cache/xpo/index.json
%LOCALAPPDATA%/xppai-ax2012/cache/xpo/extracts/
%LOCALAPPDATA%/xppai-ax2012/cache/xpo/xpo-session-auth.json
```

The AX 2012-specific environment override is `XPPAI_AX2012_CACHE_DIR`. The package config key is `ax2012XpoCacheDir`. Neither package reads the other package's environment variable or configuration file.

Every index, extract, and session-authorization record includes and validates:

```json
{
  "schemaVersion": 1,
  "product": "Microsoft Dynamics AX",
  "baseline": "2012-R3",
  "producer": {
    "package": "xppai-ax2012",
    "version": "<package-version>"
  }
}
```

All cache reads validate this identity before reading payload data. Missing, mismatched, newer, or AX 2009 metadata produces a clear rejection, including when the user deliberately passes the same `--cache-dir` to both CLIs. Future schema migration must be explicit; the CLI must not mutate an older or newer schema implicitly.

### Revision History

Loading an XPO does not delete earlier revisions. Cache history is append-only by normalized source identity and original-byte hash. The index maintains an explicit active revision without discarding predecessors.

Revision comparison must support explicit base and head revisions, and must report added, modified, and removed objects. `export-modified` never assumes that the latest two unrelated loads form a valid comparison pair.

Retention is explicit through a future prune operation or documented manual removal; the first release performs no automatic destructive cleanup of revision history.

No real customer XPO or generated customer analysis may be committed as a fixture.

## 16. CLI Surface

Initial commands:

```text
xppai-ax2012 list
xppai-ax2012 path
xppai-ax2012 install --target <target>
xppai-ax2012 export --target <target> --out <dir>

xppai-ax2012 xpo load <file>
xppai-ax2012 xpo load-stdin
xppai-ax2012 xpo snapshot
xppai-ax2012 xpo list
xppai-ax2012 xpo read
xppai-ax2012 xpo grep
xppai-ax2012 xpo export-modified
```

Initial targets mirror the existing package with the following exact installation and export behavior:

| Target | Install destinations | Export below `--out` |
|---|---|---|
| Claude | `~/.claude/skills`, `~/.claude/commands` | `skills/`, `commands/` |
| Codex | `~/.codex/skills` | `skills/` |
| Qwen | `~/.qwen/skills` | `skills/` |
| Copilot | current repository `.github/skills` | `.github/skills/` |
| Generic | not installable | `skills/`, `commands/` |

`generic` is export-only. The `install` command rejects it instead of treating `--out` as an installation destination.

### Installation Ownership

Each target installation writes a package-specific ownership manifest, for example `.xppai-ax2012-owned.json`, containing:

- package and package version;
- target adapter and install mode;
- resolved destinations for skills and commands;
- every owned relative path;
- content hash or symlink target;
- manifest schema version.

An upgrade removes only paths recorded by the previous AX 2012 manifest, still located under an approved target root, and still belonging to the `xppai-ax2012-*` namespace. The prefix is a validation boundary, not authorization to delete every matching user-created path. AX 2009 entries are installed as sentinels in tests and must remain byte-identical.

Installation is staged and validated before replacing the active entries. If skills succeed but commands or manifest writing fail, the adapter restores the prior AX 2012 installation. Reinstallation in copy and symlink modes must be idempotent.

`install` may write to runtime-specific default locations. `export --out`, including Claude export, writes a self-contained target tree below the requested output directory and must never write commands into a home-directory side path.

Removing a skill from a later AX 2012 release removes its prior installed directory through the ownership manifest without scanning or deleting unrelated entries.

## 17. Error and Uncertainty Handling

| Condition | Required behavior |
|---|---|
| XPO path cannot be read | Stop and request a corrected path or pasted content |
| Strong AX 2009 or D365 signals | Stop and report baseline conflict |
| R3 claimed without build/CU evidence | Record expected R3 plus unknown exact runtime; qualify production-ready guidance |
| Missing layer/model | Allow analysis; block production-ready code claims |
| Ambiguous requirement | Papai asks one focused question at a time |
| Insufficient bug evidence | Codefix does not invent a root cause |
| Unknown external contract | Dev does not invent a payload or protocol |
| Missing domain reference | Declare the knowledge gap; never use an AX 2009 fallback |
| Three cycles exhausted | Return findings, unknowns, and the next required evidence; never infer success from the counter |
| Country/region code involved | Detect model/layer, configuration keys, metadata, and code guards; do not modify without explicit regional scope and evidence |
| Multi-domain request | Papai synthesizes; specialists do not silently chain |

When external research is required, prefer primary Microsoft documentation and keep general product knowledge separate from customer-specific evidence.

## 18. Verification Strategy

### Package Isolation

- Existing AX 2009 tests remain unchanged and pass.
- AX 2012 does not import runtime modules from the repository root.
- The AX 2012 npm artifact contains only its own package files.
- AX 2012 installation does not remove AX 2009 assets.
- AX 2012 cache does not read or overwrite AX 2009 cache data.
- Unversioned AX 2009 skill dependencies fail AX 2012 contract tests.
- A second apparent AX 2012 `skills/` or `agents/` source tree fails the build.
- A cache with missing, AX 2009, or incompatible schema metadata is rejected under an explicit shared `--cache-dir`.
- Copy and symlink upgrades remove retired AX 2012 entries and preserve AX 2009 and user-owned sentinels.

### Skill Contracts

- Every public skill declares AX 2012 R3.
- Papai includes all accepted actions and routing rules.
- Specialists are directly invocable.
- XPO intake occurs at most once per request.
- Dev and codefix triggers remain distinguishable.
- Reference packs are loaded only when relevant.
- Missing manifest references fail tests.
- D365-only implementation constructs are rejected.

### XPO Tests

- Realistic synthetic class, table, form, query, service, and security fixtures containing nested `SOURCE #...` sections.
- Unknown-type preservation.
- Layer/model metadata capture.
- Complete, incomplete, and indeterminate input states.
- Stable byte, character, and line references plus original-byte hashes.
- The same completeness behavior for file and stdin intake.
- Independent cache identity and append-only revision comparison.
- Added, modified, and removed object detection between explicitly selected revisions.

### Manual First-Release Acceptance Flows

Before the first public release, a human AX 2012 R3 expert executes and records each flow below in `docs/technical-review.md`. Every record names the selected route, loaded references, required evidence, expected safe outcome, observed result, and unresolved unknowns. These are manual acceptance scenarios because the package distributes agent instructions rather than an AX runtime in which the generated guidance can be executed automatically.

- Explain an existing SysOperation.
- Develop a complete SysOperation.
- Explain an AIF integration.
- Develop an AIF service.
- Correct a handler bug.
- Assess a model/deployment change.
- Detect an incompatible-version artifact.
- Install AX 2009 and AX 2012 side by side.

### Independent CI and Published-Artifact Tests

CI runs the root and sibling packages as independent products:

1. Root AX 2009: clean install, tests, and `npm pack --dry-run --json` from the repository root.
2. AX 2012: clean install, tests, and `npm pack --dry-run --json` from `packages/xppai-ax2012`.
3. Assert that the root tarball does not contain the sibling package.
4. Assert that the AX 2012 tarball contains Papai `SKILL.md`, its colocated `AGENT.md`, all declared references, commands, and runtime source.
5. Build a real AX 2012 tarball, extract or install it into a temporary location, and run list/path/export/install smoke tests against the artifact rather than the source tree.
6. For every target, install AX 2009 and AX 2012 side by side with sentinels, upgrade AX 2012, remove one simulated retired AX 2012 skill, and verify ownership behavior.

The package sibling owns its own `package-lock.json`. Root `npm test` is not considered coverage for the sibling package.

### AX 2009 Preservation Baseline

Before any AX 2012 package scaffold is created, capture a read-only AX 2009 baseline containing:

- current root test count and result;
- normalized `npm pack --dry-run --json` inventory;
- names and SHA-256 hashes of published AX 2009 assets;
- normalized outputs for `--version`, `list`, and `path`.

This immutable baseline protects the published `assets/` tree, package inventory, and basic CLI identity. It deliberately does not require equality with the divergent, non-published root `skills/` tree. Target ownership is protected separately with AX 2009 and user-owned sentinels in every side-by-side adapter scenario. Cache isolation is protected by rejecting AX 2009 or incompatible identity metadata, including under an explicitly shared `--cache-dir`. AX 2012 CI fails if the captured root baseline changes without a separately approved AX 2009 change.

## 19. Architecture Gate and Minimal Improvement Path

The architecture was approved only after the following design gates were accepted:

1. **XPO grammar:** approve the top-level registry, structural-boundary rules, tri-state completeness, raw-byte preservation, and evidence-provenance contract.
2. **Cache identity:** approve exact config/cache/session-auth locations, AX 2012-specific environment/config names, metadata validation, and schema-migration policy.
3. **Canonical assets:** confirm `packages/xppai-ax2012/assets/` as the only AX 2012 source tree and prohibit mirrors.
4. **Installation ownership:** approve the per-target installed manifest, staged update/rollback behavior, safe retirement, and export destination rules.
5. **Capability routing:** approve the intent-by-domain capability matrix, reference manifest, financial-dimensions promotion, and production-ready gates.
6. **Revision semantics:** approve append-only source history, active revision, explicit base/head comparison, retention, and removed-object handling.
7. **Independent CI:** approve separate install/test/pack jobs, published-artifact tests, and side-by-side target installation tests.
8. **AX 2009 baseline:** capture and approve the published-file, asset-hash, CLI-output, and current-test baseline, plus the target and cache isolation contracts.

Current design status: all eight gates are accepted, and the synchronized implementation plan is reviewed. The commit that records this synchronized spec and plan becomes their audit baseline. Gate 8 evidence remains anchored at `d42d3ed`. Implementation still begins only after an explicit execution request.

Only after all eight gates are satisfied may implementation proceed in this order:

1. Create the self-contained package boundary using the approved baseline.
2. Implement package-local CLI, cache identity, revision store, and target ownership engine.
3. Implement and test the versioned XPO registry/parser.
4. Create core, intake, reference manifest, and Papai.
5. Create the twelve initial domain reference packs.
6. Create explain, architect, risk, codefix, and dev.
7. Create help and package documentation.
8. Run source, tarball, target, and side-by-side verification.
9. Perform AX 2012 R3 technical review.
10. Publish the package independently.

## 20. Deferred Domains

Potential later additions:

- profiler/stack analysis;
- symptom-first support;
- organization model and global address book;
- DIXF/DMF;
- production-ready promotion of the initial deferred Workflow/SSRS reference;
- broader Retail/Commerce, WHS, and TMS coverage;
- XPO/model export generation;
- deterministic Babysit orchestration.

These should be added as reference packs, capability promotions, or public skills based on behavior: a new output workflow merits a skill; additional facts for an existing workflow merit a reference pack; stronger support for an existing gated or deferred pack requires an explicit capability-status change and new evidence tests.

## 21. Shared-Kernel Exit Criteria

A shared infrastructure package may be proposed only when:

- the duplicated behavior is demonstrably identical;
- both package test suites cover its contract;
- no AX-version semantic rule would move into the shared layer;
- the AX 2009 public CLI and installed assets remain backward-compatible;
- extraction can be performed as a separately reviewed change.

## 22. Primary Technical References

- Microsoft Learn: What's new in MorphX features for AX 2012 developers — models and model store.
- Microsoft Learn: What's new in X++ for AX 2012 developers — attributes, eventing, `is`/`as`, and CIL.
- Microsoft Learn: What's new in Services and AIF — WCF services, integration ports, and SysOperation.
- Microsoft Learn: What's new in role-based security — roles, duties, privileges, and XDS.
- Microsoft Learn: What's new in AOS and database — valid-time-state tables, table inheritance, TempDB, and UnitOfWork.
- Microsoft Learn: Deprecated X++ Reporting Framework — SSRS as the primary AX 2012 reporting platform.

## 23. Review Questions

The technical review should verify:

- whether any AX 2009-only rule was incorrectly carried into R3;
- whether any R3-specific execution, framework, security, model, posting, or AIF rule is inaccurate;
- whether essential R3 domains are incorrectly deferred;
- whether the proposed reference boundaries produce safe implementation guidance.

The architecture review should verify:

- whether the package boundary genuinely preserves AX 2009;
- whether skill-versus-reference granularity is coherent;
- whether Papai and direct invocation contracts conflict;
- whether install, cache, ownership, packaging, and future extraction boundaries are enforceable;
- whether the design introduces avoidable duplication or premature complexity.

## Appendix A. Captured AX 2009 Preservation Baseline

**Capture date:** 2026-09-08  
**Git revision:** `d42d3ed` on `main`  
**Package:** `xppai@1.0.22`

Fresh baseline commands produced:

- root test suite: 59 passed, 0 failed;
- npm dry-run package inventory: 64 entries;
- packed size: 24,918 bytes;
- unpacked size: 83,940 bytes;
- npm dry-run shasum: `6ff17b2555ace689dcd88607c16b22c8e563ba1f`;
- canonical published asset count: 27 files;
- normalized asset-manifest SHA-256: `20513c173dc32a40ab5c4ab2fb03aaea248e432f387ef384d4e716f25387d4cc`;
- CLI version output: `1.0.22`;
- CLI path output: repository `assets/skills` directory;
- CLI list output: 15 canonical skills.

Canonical skill inventory:

```text
xppai-architect
xppai-babysit
xppai-codefix
xppai-core
xppai-domain
xppai-explain
xppai-exportxpo
xppai-help
xppai-init
xppai-intake
xppai-papai
xppai-posting
xppai-risk
xppai-stack
xppai-support
```

Published asset hashes:

The aggregate above is reproducible as SHA-256 over UTF-8 rows sorted by the ordinal bytes of the normalized relative path. Each row is `relative/path<TAB>lowercase-file-sha256<LF>`, including the final LF. Paths use `/` regardless of host OS.

```text
assets/agents/xppai-papai/AGENT.md                         92c14c37f2b6ba5defe4b5df4dd982b953800d47f1f417569a27a74de4a0df94
assets/commands/xppai-architect.md                         0d2a792dafc3754c7d5a7a3f7f4d8aa1a8e652f967764b6021cf4938d879b15a
assets/commands/xppai-babysit.md                           fd982cca871a06dca7f530dc2f6bcc34e9fe8d922c63fb0dc6b495a63c963cd5
assets/commands/xppai-codefix.md                           ce8ddc628bb6daa1b159c4ff7198d06ad322c00b026415afb3938a9b4f8305cf
assets/commands/xppai-explain.md                           47a89a6e42aa99144fc4b6f6f801d342f8e5b216b953f4a5d13e70f750a17a3e
assets/commands/xppai-exportxpo.md                         b905a86d124df356c1884fb039a0d65b5904fc0088d0571ef3160dc9bb29bc30
assets/commands/xppai-help.md                              398f6b1d76f5e15882ddee6f45468133c172637df421eaa2bd313d92dc830d7b
assets/commands/xppai-papai.md                             91cdd2a34b3752e271ff3685a1c6ef5ac8a56f514b1fefd3cc3fa16d06ae67c4
assets/commands/xppai-posting.md                           f428efdabaec8ea071ab3a48beeacc366fec6cba96f00531403abe1cbefd12b9
assets/commands/xppai-risk.md                              67f7c9745d273563aeda22b146656184e6d96617c0a5cfad904e803f378ca04b
assets/commands/xppai-stack.md                             f0924a3f555875d9d88e56333b2d13db4ab92c12646b0493f998e92da45756b6
assets/commands/xppai-support.md                           f8ec90233ceb7b8e8722f05e64960329433c5b6839cf6e2901587ca25b964ca8
assets/skills/xppai-architect/SKILL.md                     97eaf1988b46716fb2434ad1ba2b79c471e33a90a40d181bcdbae0f130515a93
assets/skills/xppai-babysit/SKILL.md                       938ca8e523c085699c868d81609ef2b7fada9e35768622191566e8f66d0460b3
assets/skills/xppai-codefix/SKILL.md                       550f0e464b3784bb78ff22a2c6845e371af36d6f4182310b025093d028900b9b
assets/skills/xppai-core/SKILL.md                          57f93365ec66e6313897f7dc210bd412871b6c96dbb4f5ce90b87ad7fefea2c8
assets/skills/xppai-domain/SKILL.md                        46bc553d32adee79886a39d2e244eb0001a43cdbcee4d1fa07f361a73412150c
assets/skills/xppai-explain/SKILL.md                       bcc695847d3aaf16fc925455441963f77d557257f0dcba2198c6f99f4789e42c
assets/skills/xppai-exportxpo/SKILL.md                     31e9e01df625aaa20187c5c7826ef652d4a2a2f32fdc2983a3fe2c8fafa6554f
assets/skills/xppai-help/SKILL.md                          77d991f360787e9132c25586375a87aa4fc78718df31a84da5b4265f641b5aed
assets/skills/xppai-init/SKILL.md                          551ad8621ce43b2a410aa01ec32e823086dc0a9ebb96f100694a4f78ac58506f
assets/skills/xppai-intake/SKILL.md                        6e3edd81f30756a16f42ff36132df3e8e0c101300d631d3f00649ec49e4d7b68
assets/skills/xppai-papai/SKILL.md                         b0b7e41f18e33161143cc36b08f832304b909378a2e61cb64e1a588aac7a3f16
assets/skills/xppai-posting/SKILL.md                       94bc4548568a094741d2ca499248a77d08296b973f119520ad1ca9c9cc2c395c
assets/skills/xppai-risk/SKILL.md                          0dd6d44094c9098fb93a3b2160cd7a3ed0d5fd4522048950ae85727fd60d82d3
assets/skills/xppai-stack/SKILL.md                         df4bcd68bd878f14c2251dd9aafa89b03c3488922ebce7223ba7b263779ad7f5
assets/skills/xppai-support/SKILL.md                       a4658941f3568af4aa1cfba7b6bee1d74ec63ab244c865485ddad8333691a6ca
```

Current target contract:

| Target | Default destination | Published behavior |
|---|---|---|
| Claude | `~/.claude/skills` | 15 skills; 12 command files are also written to `~/.claude/commands` |
| Codex | `~/.codex/skills` | 15 skills |
| Qwen | `~/.qwen/skills` | 15 skills |
| Copilot | repository `.github/skills` | 15 skills |
| Generic | export-only | 15 skills |

Current AX 2009 cache/config contract:

```text
default cache     %LOCALAPPDATA%/xppai/cache/xpo
user config       %LOCALAPPDATA%/xppai/config.json
session auth      %LOCALAPPDATA%/xppai/cache/xpo-session-auth.json
environment       XPPAI_CACHE_DIR
config key        xpoCacheDir
precedence        --cache-dir → user config → environment → default
```

This baseline is accepted as architecture gate 8. The current non-published root `skills/` mirror is intentionally excluded.

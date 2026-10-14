# D365FO technical particularities for xppAI 365

Research date: 2026-10-13 (America/Sao_Paulo).

Review incorporated: 2026-10-14. The user approved the reviewed design direction. The written specification is maintained in [xppAI 365 design](superpowers/specs/2026-10-14-xppai-365-design.md).

Status: technical research and product constraints; not an implemented package or an approved implementation plan. Microsoft documentation was consulted for this document. Documentation establishes platform behavior, not the customer's installed build or application metadata.

## Requested product boundary

- Provide the same code-assistance experience as xppAI AX 2012: the user supplies code or related evidence and receives explanation, review, corrected code, or new code.
- Target Dynamics 365 Finance and Supply Chain Management X++ development (D365FO), not Business Central AL or Dataverse plug-in development.
- Do not connect to databases or customer environments. Do not require credentials, an environment URL, a local D365 installation, or Visual Studio automation to analyze supplied code.
- Public documentation research is allowed. Customer source remains within the user's selected assistance workflow; it must not be sent to public search engines.
- Exclude Ririchard and Frigelar compliance rules, including TagFGL and the legacy AIF naming catalog, as explicitly requested.
- Keep the existing AX 2009 and AX 2012 products independent and preserve their local changes.
- Keep technical documentation, skill instructions, diagnostics, and code identifiers in English. User-facing conversation can remain Portuguese.

The absence of a database connection does not prevent reviewing X++ queries, table methods, transactions, or data entities. It limits verification to supplied source and evidence. It does not establish query results, configuration, runtime permissions, performance, or successful execution.

## 1. Visual Studio, models, and packages

D365FO development uses Visual Studio tools and Application Explorer. A model groups application elements; it belongs to a package. Packages are compilation/deployment units. A Visual Studio project can contain elements from only one model, while a solution can contain several projects. The project folder does not determine the storage location of model-element XML files. [Models and packages](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/dev-tools/models), [Project type](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/dev-tools/projects).

For xppAI, a method-level explanation should not demand an entire project. Ask for the owning object, model references, or relevant metadata only when those facts affect the requested change. A missing package reference must not be misdiagnosed as an X++ syntax error.

The unified developer experience currently documents Visual Studio 2022 and its Power Platform/FinOps tooling. Do not assume that all customers use the same development topology, tooling version, package path, or deployment workflow. These are facts to collect when relevant, not prerequisites for ordinary source review. [Unified development tools](https://learn.microsoft.com/en-us/power-platform/developer/unified-experience/finance-operations-install-config-tools).

## 2. Source artifacts are not AX 2012 XPOs

D365FO source control can contain XML metadata organized by package/model separately from Visual Studio projects. A project reference alone is not the referenced object's implementation. [Source control and metadata](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/dev-tools/version-control-metadata-navigation).

Visual Studio supports project export/import through `.axpp` files. This is a project-transfer format, not an AX 2012 XPO or a production deployment package. [Project import/export](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/dev-tools/projects).

Recommended initial intake:

| Supplied evidence | Useful analysis | Limits |
| --- | --- | --- |
| Pasted X++ method or class | Explain behavior, identify defects, return a correction | Other methods, metadata, callers, and extensions remain unknown |
| User-selected text files or repository paths | Read the explicitly supplied source and its available context | Do not discover a customer environment or scan unrelated directories |
| Element XML, extension XML, model descriptor | Inspect supplied metadata and embedded source | Missing references or omitted elements remain unknown |
| Diff, compiler messages, stack trace | Review a change or diagnose a concrete failure | Do not invent surrounding code or claim reproduction |
| `.sln` or `.rnrproj` without element source | Identify supplied project context and references | Request the relevant implementation when needed |
| `.axpp`, `.axmodel`, or deployment archive | Identify the artifact and request source if it cannot be read reliably | No initial promise of archive parsing, import, round-trip writing, or deployment |
| AX 2012 XPO | Discuss an explicitly requested migration | Never interpret it as native D365FO metadata |

These are proposed product boundaries, not claims that a parser already exists. The AX 2012 byte-preserving XPO parser/cache must not be copied and relabeled as D365FO support.

### Output for Visual Studio

Return a complete method, complete class, focused diff, or explanation according to the request and available source. Identify the target element and method or metadata property, and state whether to add an extension/new element or edit an existing custom element. Do not invent an absolute model-store path.

When behavior also requires metadata changes, name the required elements and properties explicitly. Return modified XML only when the supplied source is sufficient to preserve the element and its unrelated content; otherwise provide concrete Application Explorer/designer instructions and request only the missing metadata needed for a reliable edit. Distinguish copyable source from a complete importable or deployable artifact.

## 3. Extension-based customization

Modern D365FO customization centers on extensions. Do not recommend modifying Microsoft-owned base elements through overlayering as the standard implementation approach. Distinguish a metadata extension, an extension class, a new custom element, and a handler attached to a published event. [Extensibility overview](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/extensibility/extensibility-home-page).

Before selecting an extension point, inspect the supplied base declaration and relevant metadata. A familiar AX class name does not prove that a method exists, remains extensible, or has the same signature in the customer's build. If the required extension point is unavailable, explain the limitation and identify a supported alternative or the need for an extensibility request.

## 4. Chain of Command (CoC)

CoC needs dedicated guidance, not a substitution of `next` for every AX 2012 `super` call:

- Match the base method signature; omit default parameter values in the wrapper declaration.
- Use an appropriate `[ExtensionOf(...)]` target and a final extension class.
- Check visibility and extensibility attributes, including `Wrappable`, `Hookable`, and `Replaceable`.
- Ordinarily call `next` unconditionally and preserve its return value when required. A documented replaceable method is a distinct case.
- Do not assume extension ordering as an application contract.
- Treat form roots, data sources, data fields, and controls as different targets; each needs the correct metadata name and method signature.
- Check version-specific restrictions. Compilation alone does not prove that a wrapper on a nested form method will execute.
- Do not suggest constructor wrapping.

[Microsoft CoC reference](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/extensibility/method-wrapping-coc).

Product behavior: if the base method is missing, provide a conditional explanation or request that declaration. Do not invent a wrapper and present it as verified against the target application.

## 5. X++ runtime and language

X++ compiles to .NET CIL. AX 2012's AX32 client p-code versus server CIL distinction is not the D365FO execution model, and its separate Full CIL generation checklist must not be reused. [X++ language reference](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/dev-ref/xpp-language-reference).

Keep platform syntax rules separate from team style. Do not declare an old AX coding convention to be a D365 compiler restriction. Inspect available signatures and reference assemblies before proposing CLR calls. A local Node test cannot compile X++ or establish the availability of a customer's application APIs.

## 6. Transactions, exceptions, and retry

`forUpdate` and `ttsLevel` checks still matter: selection for update and the subsequent update/delete must respect transaction scope. Nested `ttsCommit` calls do not independently commit while an outer transaction remains open. Preserve caller-owned transaction boundaries. [Transactional integrity](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/dev-ref/xpp-data/xpp-transaction).

`retry` restarts the associated `try`, not merely the failed statement, and clears Infolog messages written since entering that `try`. Retry must be bounded. Preserve exception-specific transaction behavior; do not insert a catch inside a transaction on the assumption it can handle every exception there. [Exception handling](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/dev-ref/xpp-exceptions).

Product policy: retry only work whose repeated effects are understood. Do not assume a macro's value from its name, swallow an error to make a flow appear successful, or wrap every method in a generic catch. Distinguish database rollback from irreversible external effects such as sending a message.

## 7. Data access, company, and metadata

For a supplied query, reason from its actual table/field names, relations, filters, and use of the result. A snippet does not prove an index, relation, `SaveDataPerCompany`, production data distribution, or a performance improvement.

Retain the existing company's context by default. Introducing `changeCompany` or `crossCompany` requires a business requirement that actually needs it. Do not infer cross-company intent merely from a company field.

Review writes in the context of framework validation, events, and extension behavior. Avoid replacing framework operations with direct updates or bypass methods without evidence of equivalent behavior. Do not claim that supplying XML proves database synchronization occurred.

Extensible enums need special care: integer values of extension-added members are not stable identifiers across synchronization contexts. Avoid numeric assumptions or range ordering based on those values; inspect the enum and its consumers. [Enum extensions](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/extensibility/add-enum-value).

## 8. Integrations and data entities

Data entities provide an application-level representation over underlying tables and support import/export and integration scenarios. OData exposure depends on public entity configuration. Do not assume a public collection name, key, or write behavior from the table name. [Data entities](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/data-entities/data-entities).

D365FO service guidance must distinguish OData, custom services, and data-management scenarios. AXD document services are replaced by data entities; AX 2012 AIF inbound-port procedures are not a default D365FO deployment recipe. Authentication and application authorization also remain separate concerns. [Service endpoints](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/data-entities/services-home-page).

For this product, integration assistance is source/contract review and generation only. No live calls, endpoint discovery, credential collection, or database inspection are needed. Validate against supplied entity metadata, service operations, contracts, and anonymized payloads. Do not add connectors just because the reviewed code implements an integration.

## 9. Batch processing and SysOperation

Inspect the supplied controller, contract, service, and execution path instead of inventing their relationship. Consider company context, serialized parameters, identity, execution without an interactive form, and repeated execution.

D365FO distinguishes task retry settings from retry behavior for transient SQL connection errors. `BatchRetryable` and idempotent batch configuration are relevant mechanisms, but marking an operation retryable does not make its business effects idempotent. [Batch retries](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/sysadmin/retryable-batch).

Preserve the transient exception when relying on automatic retry. Converting `TransientSqlConnectionError` into `Exception::Error` can prevent the batch framework from recognizing the retryable failure. The documented pattern preserves the original exception rather than replacing its type. [Transient exception handling](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/sysadmin/retryable-batch).

Product policy: establish duplicate prevention and transaction/external-effect boundaries before proposing retry configuration. Never claim that a batch ran successfully from a source-only review.

## 10. Security

Review entry points, permissions, privileges, duties, and roles where they affect the change. XDS policies can further restrict record access. A class declaration or a successful administrator test does not establish access for the intended user. [Security architecture](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/sysadmin/security-architecture).

Ask for the relevant security metadata only when needed. Do not infer effective assignments from a model's source. Keep customer credentials outside this assistance contract.

## 11. Build, synchronization, deployment, and tests

Report different kinds of evidence separately:

1. **Static source inspection:** findings supported by supplied code/metadata.
2. **xppAI package checks:** installer, asset, routing, and fixture checks executed locally.
3. **D365FO validation:** compilation, best-practice diagnostics, database synchronization when applicable, and execution/tests in the customer's compatible development environment.

The third category requires supplied execution evidence; the first two do not imply it. D365FO supports SysTest and other validation tools. Provide focused test cases or test code when useful, and distinguish proposed tests from executed results. [Testing and validation](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/perf-test/testing-validation).

Do not hardcode one deployment recipe for every topology. A source correction, an `.axpp` transfer, and a deployable package are different deliverables. The assistant should explain only the build/synchronization/deployment implications relevant to the supplied change.

## 12. Knowledge limits and economical operation

- Keep application version, platform build, installed extensions, feature configuration, localization, and execution identity unknown until evidence establishes them.
- Preserve useful analysis when metadata is incomplete; qualify only the affected conclusion and request the smallest missing artifact.
- Do not treat official sample code as proof of the customer's exact method signatures or runtime behavior.
- Return the requested answer/code first. Keep routing, reference selection, and confidence bookkeeping internal unless they change the result.
- Load only relevant technical sections. Do not reread every reference for a small method correction.
- Avoid automatic multi-agent orchestration, repeated intake, fixed lengthy reports, and mandatory project scaffolding for user code questions.
- Financial posting, inventory, dimensions, localization, workflow, and reporting need application-specific evidence. Do not copy AX 2012 business references and declare them verified for D365FO.
- Team naming and label conventions should be explicit project preferences. Do not import the excluded Frigelar catalog indirectly through another skill.

## 13. Repository findings and recommended adaptation

Inspected current sources:

- `packages/xppai-ax2012/package.json` and `README.md`: independent CommonJS package, its own commands and release lifecycle; root is not an npm workspace.
- `src/constants.js`: ten AX 2012 skills, including Ririchard.
- `src/cli.js`: `list`, `path`, `install`, `export`, and `xpo` command families.
- `src/targets/` and `src/ownership/`: installation/export adapters and package-specific ownership protection.
- `assets/skills/`: core evidence rules, intake, intent routing, and specialists.
- `assets/references/manifest.json`: version-scoped references selected by domain.

Approved design direction: an independent `packages/xppai-365` package with nine skills (`core`, `intake`, `papai`, `explain`, `architect`, `risk`, `codefix`, `dev`, `help`), the existing installation/export experience, and D365FO-specific references. Source analysis remains an assistant skill workflow; the CLI distributes those skills and does not become an X++ compiler or an autonomous environment connector.

Reuse the proven installation structure where suitable, with independent product identity and ownership. Rewrite platform guidance deliberately. Initially omit XPO commands, persistent source caches, binary artifact conversion, database/environment connectors, and a Visual Studio extension. User-supplied text/code/metadata is sufficient for the requested core workflow.

Reuse infrastructure, not AX 2012 skill contracts. In particular, do not carry over mandatory Tag ID/Project ID/Dev Name collection, AX 2012 CU or Full CIL procedures, layer-first readiness gates, or top-of-method variable declarations as a D365FO language restriction. Removing Ririchard alone would not remove these assumptions from the other AX 2012 skills.

Acceptance must include actual assistant responses to fixed, synthetic inputs, with expected behavior and forbidden claims. The written specification defines the cases: method correction, CoC with supplied and missing signatures, metadata explanation, incomplete compiler evidence, and batch retry. Record the model/runtime, input, response, and assessment; do not replace response evaluation with keyword checks over skill files.

Check installer/export behavior separately: reference availability, namespace ownership, safe upgrades, and coexistence with existing products. Neither category establishes D365FO compilation or runtime validation.

No D365FO compilation, database synchronization, environment access, or deployment was performed for this research.

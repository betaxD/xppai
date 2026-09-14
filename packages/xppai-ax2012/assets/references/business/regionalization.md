# Regionalization

Baseline: Microsoft Dynamics AX 2012 R3

Capability: gated for production-ready codefix and dev; preliminary explain, architect, and risk remain available.

## Scope

Analyze country/region code, localization configuration, model and layer ownership, configuration keys, metadata, code guards, legal-entity scope, reporting/tax/posting consequences, and the exact regional business process. Do not treat one hardcoded tag list as the complete AX 2012 regional policy.

## Evidence required

- Explicit affected countries/regions, legal entities, partition, product/localization configuration, license and configuration keys, and enabled feature metadata.
- Application/kernel build, CU/hotfix context, model/layer, effective top-layer implementation, code guards, labels/resources, xRef/callers, handlers/subscribers, and ISV/localization dependencies.
- The exact document, tax, posting, reporting, banking, regulatory, or integration flow plus representative regional fixtures and expected results.
- Cross-region regression plan, compliance owner, deployment/CIL/database implications, and rollback behavior.

## Decision rules

Before all applicable gates pass, return preliminary analysis, unknowns, and the next required evidence. Never generalize behavior from another AX baseline, country, layer, model, configuration key, or legal entity.

A production-ready recommendation identifies the affected regional behavior, proven scope, model/layer, configuration and metadata gates, guarded code path, validation cases, and explicit unaffected regions. Missing regional scope or ownership keeps the conclusion `Unknown`.

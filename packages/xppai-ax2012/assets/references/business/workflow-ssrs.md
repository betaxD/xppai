# Workflow and SSRS

Baseline: Microsoft Dynamics AX 2012 R3

Capability: deferred. This release supports preliminary explanation, architecture inventory, and an explicit gap report only. It must not produce production-ready codefix or dev guidance.

## Scope

Inventory workflow types, templates/configurations, documents, approvals, providers, work items, batch processing, and security; or SSRS contracts, controllers, RDP/query/data methods, report designs, menu items, deployment targets, permissions, and execution context. These inventories define what a future capability promotion must cover.

## Evidence required

- Whether the request concerns workflow, SSRS, or both, plus the exact user-visible behavior and intended change.
- Workflow type/configuration, document/provider classes, conditions, participants, approvals, batch history, work-item state, security, and notifications when relevant.
- Report contract/controller, RDP/query/data source, design, expression/code, parameters, menu item, security, server configuration, deployment, and execution logs when relevant.
- Model/layer, application/kernel build, CU/hotfix, xRef/callers, CIL/SSRS deployment state, reproducible fixtures, expected output, and expert-reviewed framework patterns.

## Decision rules

Return a gap report containing the known artifact graph, missing evidence, risks, and the validation required to promote this domain. Do not provide production-ready implementation, patch, or deployment instructions in the initial release.

Route cross-cutting security, execution-context, data, dimensions, and regional facts to their authoritative references, while keeping workflow/SSRS-specific conclusions preliminary.

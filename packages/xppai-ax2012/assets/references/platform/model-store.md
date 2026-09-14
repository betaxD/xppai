# Model Store and Deployment

Baseline: Microsoft Dynamics AX 2012 R3

Capability: supported for explain, architect, risk, codefix, and dev when the evidence below is available.

## Scope

- Distinguish the model store, layers, models, current model, element identity, and installation-local element IDs.
- A model belongs to one layer; each element in a layer belongs to one model. Layer and model are separate required identities.
- Treat the business database and its conventionally named `<BusinessDatabase>_model` database as coordinated deployment and recovery state.
- Distinguish `.axmodel` single-model artifacts from `.axmodelstore` complete-store artifacts.
- Treat XPO as granular analysis/interchange evidence. XPO alone cannot prove the effective implementation, owning model, top layer, xRef, subscribers, or portable element IDs.
- Account for AxUtil or relevant AX 2012 PowerShell operations, compilation, best-practice checks, database synchronization, full CIL, AOS refresh/restart, and affected services or reports.

## Evidence required

- Application build, kernel build, CU/hotfix context, topology, and target environment.
- Current model and layer plus model-store metadata for every affected element.
- Effective top-layer implementation and dependency/conflict evidence.
- Artifact type, source environment, dependency list, import mode, and signed-off deployment window.
- Database-change assessment, coordinated business/model-store backups, validation queries, and rollback owner.

## Decision rules

An `.axmodel` import is not equivalent to importing a complete model store. A model-store deployment is not interchangeable with source XPO import. Installation-local element IDs are evidence for one environment, not stable cross-environment identity.

Express deployment as an ordered playbook: validate builds and dependencies; create coordinated backups; drain or stop AOS instances when required; import; resolve conflicts; compile and run best-practice checks; assess and perform database synchronization; generate full CIL; refresh or restart every AOS; then refresh impacted SSRS, Enterprise Portal, assemblies, services, and integration ports.

Do not call a rollback viable unless it covers both databases and any schema or data transformation. Keep the result `Unknown` when effective-layer or dependency evidence is missing.

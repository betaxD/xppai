# Application Integration Framework

Baseline: Microsoft Dynamics AX 2012 R3

Capability: supported for explain, architect, risk, codefix, and dev.

## Scope

Cover inbound and outbound integration ports; basic and enhanced inbound ports; custom service, document service, and system service boundaries; service groups and operations; WCF hosting; AOS execution; `Axd*` document-service classes; schemas, namespaces, transforms, adapters, queues, history, exceptions, batch, activation, service refresh, and CIL.

Distinguish synchronous from asynchronous pipelines and inbound from outbound processing. Distinguish AOS-hosted intranet services from Internet exposure routed through IIS/WCF while execution remains on AOS. Transport authentication identifies a caller but does not grant AX functional authorization.

Company and partition come from a proven call context or an explicit contract. Do not silently fall back to user defaults. Treat retries as an idempotency requirement, not only an exception-handling concern.

## Evidence required

- Service group, operation, service class, document query/Axd class where relevant, schemas, namespaces, transforms, adapter, and active port configuration.
- Direction, basic/enhanced port type, synchronous/asynchronous mode, endpoint topology, bindings, authentication, effective service identity, company, and partition.
- `SysEntryPointAttribute`, privilege/duty/role assignments, underlying table access, XDS behavior, and a non-admin/service-account test.
- WSDL or service-discovery result, activation state, service refresh, queues/history/exceptions, assembly deployment, application/kernel build, and full CIL evidence.

## Decision rules

Document services and custom services have different contracts and lifecycle responsibilities. Validate schema/namespace compatibility, transformation placement, port activation, serialization, transaction ownership, duplicate handling, retry policy, authorization, and observable failure handling.

Do not generalize AX 2009 AIF behavior into AX 2012 R3. Keep external payload details `Unknown` until the actual contract is supplied. Production readiness requires discovery, activation/refresh, authorization, effective context, failure-path, and CIL validation.

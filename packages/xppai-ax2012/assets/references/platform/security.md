# Role-Based Security, XDS, and CAS

Baseline: Microsoft Dynamics AX 2012 R3

Capability: supported for explain, architect, risk, codefix, and dev.

## Scope

Cover roles, duties, privileges, permissions, entry points, segregation of duties, permission inference, linked permissions, `AOSAuthorization`, table/field access, extensible data security (XDS), service-operation authorization, and Code Access Security (CAS) boundaries for protected APIs.

Every exposed service operation, RDP/server operation, and menu entry point requires the appropriate `SysEntryPointAttribute`, privilege, duty, role assignment, and underlying permissions. Permission inference is review input, not a substitute for explicit authorization design. Transport authentication is not AX functional authorization.

## Evidence required

- Exact menu item or service/RDP entry point, method, `SysEntryPointAttribute`, and call path.
- Privilege, duty, role, user/service/batch assignment, linked permissions, table permissions, and segregation-of-duties constraints.
- Effective identity, partition, company, XDS policies/queries, `AOSAuthorization`, and any CAS assertion/revert scope.
- Tests using representative non-admin users and service/batch accounts, including allowed and denied cases.
- Application/kernel build, model/layer, CIL status, and deployment evidence for changed artifacts.

## Decision rules

Review inferred permissions for indirect/dynamic calls and protected tables. Test XDS under the effective non-admin identity and company/partition context. Verify deny behavior as well as allowed behavior; administrator success is not least-privilege evidence.

Keep access `Unknown` when assignments, XDS, or effective identity are missing. Do not recommend disabling checks or broadening roles as a diagnostic shortcut. Scope CAS assertions as narrowly as possible and preserve exception-safe cleanup.

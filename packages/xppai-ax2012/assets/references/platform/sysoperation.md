# SysOperation Framework

Baseline: Microsoft Dynamics AX 2012 R3

Capability: supported for explain, architect, risk, codefix, and dev.

## Scope

Trace the complete controller -> contract -> service flow, including entry points, `DataContractAttribute`, serializable parm methods with `DataMemberAttribute`, service operation, UI builder, `SysOperationContractProcessingAttribute`, execution mode, parameter persistence, retry/error behavior, Action menu item, security, batch, and CIL.

## Minimum production-ready pattern

- Mark the contract with `DataContractAttribute` and each serialized parm method with `DataMemberAttribute`.
- Keep the service method free of client/UI dependencies and protect it with the appropriate `SysEntryPointAttribute`.
- Configure the controller with the exact service class, method, execution mode, and dialog behavior.
- Add a UI builder or contract-processing attribute only when the UI contract requires it.
- Expose the controller through an Action menu item with an explicit security entry point.
- Preserve parameter persistence compatibility when changing an existing contract.
- Validate synchronous, asynchronous, and batch/CIL modes that the design supports.

## Evidence required

- Controller, contract, service, parm methods, UI builder, menu item, privilege, and relevant call sites.
- Intended synchronous/asynchronous/batch behavior, recurrence, retries, impersonation setting, company/partition, and effective identity.
- Serialization/persistence compatibility and existing stored batch parameters.
- Application/kernel build, model/layer, compile output, full CIL result, and real execution-mode test output.

## Decision rules

Do not infer a valid service operation from attributes alone. Check the exact class/method binding, server-safe dependencies, security, transaction ownership, retry idempotency, and parameter serialization. Interactive success is not evidence that batch execution is safe.

When evidence is incomplete, separate the confirmed object graph from unknown runtime binding, security, persistence, and CIL behavior. Production readiness remains blocked until those gates pass.

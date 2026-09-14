# X++ Language, Eventing, and Execution Context

Baseline: Microsoft Dynamics AX 2012 R3

Capability: supported for explain, architect, risk, codefix, and dev.

## Scope

- X++ attributes, delegates, subscriptions, pre/post event handlers, the `is` and `as` operators, CLR interop, proxies, and managed exceptions.
- Client versus AOS execution, p-code versus CIL, batch/service behavior, compilation, debugging, and deployment consequences.
- Code Access Security for protected file, interop, and server APIs.
- The shared execution model: entry point -> host -> execution engine -> effective identity -> partition -> company -> privilege/entry point/XDS/CAS -> transaction scope -> deployment artifact.

Pre/post event handlers are not Chain of Command and have no `next` call. Validate supported handler signatures and the correct `XppPrePostArgs` accessors for instance, arguments, and return values. Handlers inherit tier and transaction context; they must be CIL-compatible when the publisher is batch/service reachable. Do not rely on subscriber order without a proven platform contract.

For CLR interop, distinguish X++ exceptions from `Exception::CLRError`; inspect the CLR inner-exception chain and preserve the host identity, tier, assembly version, and deployment evidence.

`changeCompany` and `crossCompany` operate only across companies in the current partition. They do not cross partitions. Do not hardcode `DAT`, `Initial`, or another default when the contract requires explicit context.

## Evidence required

- Entry point, call path, host, client/server tier, and actual execution engine.
- Effective user or service identity, partition, company, security entry point, transaction level, and affected deployment artifact.
- Method signatures, publisher/subscriber definitions, compile target, CIL status, and all relevant exception output.
- Application/kernel build and model/layer for version-sensitive or production-ready guidance.

## Decision rules

Treat AX32 interactive execution as p-code and batch/service execution as CIL. A `Server` declaration alone does not prove the observed path ran in CIL. Require batch/service-reachable code to compile and be tested in CIL and in its real execution mode.

Do not use D365 extension-class patterns or Chain of Command in AX 2012 R3. Preserve top-of-method declarations, X++ transaction behavior, aggregate-result behavior, and the documented runtime context.

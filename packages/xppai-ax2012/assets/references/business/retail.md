# Retail

Baseline: Microsoft Dynamics AX 2012 R3

Capability: gated. Explain, architect, and risk may provide preliminary findings; codefix and dev move beyond preliminary guidance only after every relevant gate passes.

## Scope

Cover only the installed AX 2012 R3 Retail components and the evidenced head-office, channel, store, POS, assortment, pricing, transaction, statement, or synchronization flow. This reference does not expand support to Commerce generally.

## Evidence required

- Proof of installed Retail components, license/configuration keys, application/kernel build, CU/hotfix level, topology, and deployed channel/store components.
- Channel and store identifiers, legal entity, partition, database/profile configuration, job/schedule, distribution/synchronization state, and affected transaction flow.
- Exact AOT objects, model/layer ownership, top-layer implementation, xRef/callers, integrations, batch/service context, security identity, and logs.
- Reproduction, expected result, message/job history, data reconciliation, deployment/CIL requirements, and a store/channel-safe rollback plan.

## Decision rules

Before the gate passes, return preliminary guidance with confirmed inventory, unknowns, and the next required evidence. Do not invent Retail configuration, schema, payload, synchronization jobs, or production-ready code.

When the gate passes, scope guidance to the evidenced R3 Retail flow. Route shared inventory, dimensions, posting, AIF, security, and regional behavior to the corresponding references rather than duplicating their rules.

# Product, Inventory, and Trade

Baseline: Microsoft Dynamics AX 2012 R3

Capability: supported for the initial sales, purchase, inventory, and posting scope; costing conclusions require explicit costing evidence.

## Scope

Cover product, product master, variant, and released-product boundaries; product, storage, and tracking dimension groups; `InventDim` construction/reuse; `InventTrans` ownership and state transitions; reservations, marking, on-hand context, posting side effects; sales and purchase order lifecycles; and costing gates.

WHS, TMS, and Commerce are outside the initial production-ready scope even when they touch inventory. Retail is routed separately through `business.retail`.

## Evidence required

- Released product, item/model groups, dimension groups, active dimensions, `InventDim` values, company, site/warehouse/location, batch/serial, and ownership context.
- Exact sales, purchase, transfer, movement, counting, reservation, marking, or posting entry point and lifecycle status.
- `InventTrans` origin/state evidence, on-hand and reservation snapshots, posting profile, financial dimensions, costing model/date, settlement/close state, and expected side effects.
- Layer/model, effective call path, transaction scope, handlers/subscribers, batch/CIL context, and before/after reconciliation queries.

## Decision rules

Construct or find `InventDim` through supported APIs and validate required dimensions. Do not directly mutate framework-owned `InventTrans` state, reservations, on-hand aggregates, posted inventory journals, or costing/settlement records.

Do not generalize one order status or inventory transaction state to the full lifecycle. Load `business.ledger-posting` and `business.financial-dimensions` when the change crosses posting or accounting boundaries. Keep cost impact `Unknown` without the actual costing and settlement evidence.

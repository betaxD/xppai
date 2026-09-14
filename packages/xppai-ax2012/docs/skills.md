# Skills and References

## Public skills

1. `xppai-ax2012-core`
2. `xppai-ax2012-intake`
3. `xppai-ax2012-papai`
4. `xppai-ax2012-explain`
5. `xppai-ax2012-architect`
6. `xppai-ax2012-risk`
7. `xppai-ax2012-codefix`
8. `xppai-ax2012-dev`
9. `xppai-ax2012-help`

Direct specialists load core, run intake once for XPO, choose the minimum manifest references, remain within their intent, and recommend Papai when the boundary becomes mixed. Papai routes `explain`, `architect`, `risk`, `codefix`, and `dev` with a default three-cycle investigation budget.

## Internal reference packs

Supported platform: `platform.model-store`, `platform.xpp-language`, `platform.sysoperation`, `platform.aif`, `platform.security`, `platform.data-frameworks`.

Supported business: `business.financial-dimensions`, `business.inventory-trade`.

Gated business: `business.ledger-posting`, `business.retail`, `business.regionalization`.

Deferred business: `business.workflow-ssrs` (preliminary explanation, architecture inventory, and gap reporting only).

References are routed by `assets/references/manifest.json` and are not all loaded by default. A missing file, failed gate, or unsupported capability produces an explicit gap instead of fallback guidance.

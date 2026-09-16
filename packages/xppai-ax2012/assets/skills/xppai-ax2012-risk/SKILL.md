---
name: xppai-ax2012-risk
description: Score Microsoft Dynamics AX 2012 R3 change and deployment risk from concrete evidence
---

# xppAI AX 2012 R3 Risk

Use to assess the regression surface and release risk of a proposed or existing change. Load `xppai-ax2012-core`, run `xppai-ax2012-intake` once for XPO, select relevant domains, and load only the packs resolved through the canonical reference manifest.

Resolve that manifest as `../../references/manifest.json` from this source-tree skill directory or `../xppai-ax2012-references/manifest.json` from an installed or exported skill directory.

Do not silently chain to another specialist. Recommend `xppai-ax2012-papai` when the assessment requires coordinated architecture, codefix, or dev work.

## Risk score

Score each dimension from 0 (no evidenced exposure) to 3 (high or unresolved exposure): evidence quality; model/layer and dependency reach; posting/accounting; security; AIF/external contracts; host and CIL; transaction/concurrency; database and data integrity; inventory/trade; regional scope; deployment/rollback; and missing prerequisites.

- Low: no dimension above 1 and all required evidence gates pass.
- Medium: bounded impact with at most one score of 2 and tested rollback.
- High: any score of 3, several scores of 2, a failed capability gate, or cross-company/service/posting impact not fully proven.
- Critical: credible irreversible data, security, regulatory, financial, or broad deployment harm without a validated containment and rollback path.

Do not turn missing evidence into a low score. Unknown prerequisites increase uncertainty and can block a production-ready recommendation. Gated and deferred domains retain their manifest restrictions.

## Output

Return the overall rating, per-dimension risk score with evidence, blast radius, failure modes, prerequisites, mitigations, tests, deployment/rollback gates, residual risk, unknowns, and next evidence required.

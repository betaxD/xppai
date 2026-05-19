---
name: xppai-review
description: Use to validate XppAI outputs before final delivery, especially to enforce Tag ID block compliance and ensure no edits are proposed inside localization blocks (<GBR>, <GIN>, <GJP>, <GSA>, <GTH>).
---

# XppAI Review

Run this as a final gate before returning fix/review/report output.

## Primary Checks

1. Tag compliance
- If code changes are proposed, confirm tag blocks are present:
  - `//<TagId - ProjectId - DD/MM/YYYY - DevName>`
  - `//</TagId - ProjectId - DD/MM/YYYY - DevName>`
- Confirm required tag fields are present: `Tag ID`, `Project ID`, `Dev Name`, date.
- Confirm date format is `DD/MM/YYYY`.

2. Localization protection
- Confirm output does not propose changing lines inside localization blocks:
  - `<GBR>`, `<GIN>`, `<GJP>`, `<GSA>`, `<GTH>` (including comment-style tag variants).
- If proposed fix touches localized code, mark as fail and require rewrite with a non-localized alternative.

## Secondary Checks

- AX 2009 constraints respected (no D365 syntax/patterns).
- Variable declarations at top of method for X++ code snippets.
- Assumptions explicitly called out when context is incomplete.

## Output Format (strict)

Return only:

```text
Review result: PASS|FAIL
Failed checks: <comma-separated rule ids or "none">
Required corrections: <short imperative list or "none">
```

## Rule IDs

- `TAG-1`: Missing tag block markers
- `TAG-2`: Missing Tag ID / Project ID / Dev Name / date
- `TAG-3`: Invalid date format for tag
- `LOC-1`: Proposed edit inside localization block
- `AX-1`: Non-AX2009 pattern in fix snippet
- `AX-2`: Variable declarations not at top
- `DOC-1`: Missing assumptions when required

If `Review result: FAIL`, upstream orchestrator must revise and re-run this review once before finalizing output.


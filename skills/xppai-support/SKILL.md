---
name: xppai-support
description: Use when an AX 2009 issue starts as a business symptom or support error and you need a standard-first troubleshooting cause tree that can escalate to customization and XPO analysis when needed.
---

# XppAI Support

**REQUIRED BACKGROUND:** Load `xppai-init` before applying this skill.

## Purpose

Use this skill when the user reports functional or operational AX 2009 support issues before providing code artifacts. Start from the standard AX 2009 process, narrow the likely causes, ask the next best support questions, and escalate to customization analysis only when evidence points there.

## Support Symptom

Restate the issue in AX 2009 terms. Separate the reported symptom from the root cause. Do not claim certainty when the prompt only provides the error message or business complaint.

## Likely AX 2009 Area

Identify the most likely standard area involved, such as sales posting, inventory availability, reservation, inventory dimensions, tax, posting setup, number sequence, or permissions. Explain why that area is the most likely starting point.

## Cause Tree

List standard AX 2009 causes first. For each branch include:

Use the evidence labels Confirmed, Likely, Hypothesis, or Unknown.

- Evidence
- Why it fits
- How to check in AX
- Next question

Prefer checks a consultant, key user, or support analyst can perform without code first. Keep the tree narrow enough that the next action is obvious.

## Customization Check

Ask whether the failing flow has customization, integration, modified validation, posting hooks, or custom reservation logic.

If customization is confirmed or likely:

1. Ask which object or process was customized.
2. Ask whether the user can provide the relevant `.xpo`.
3. If XPO is provided, return control to Papai for direct-file or pasted-text artifact analysis.

Do not assume customization first. Treat it as a branch that must be confirmed.

## Suggested Next Step

End with one concrete next action. That can be either:

- a standard AX 2009 check the user should perform next, or
- a request for the relevant XPO when customization is likely enough to justify artifact analysis

## Example: "Not enough items in stock" during sales posting

Possible standard branches include:

- available physical inventory is lower than the requested issue quantity
- reservation has consumed the wrong dimensions or the wrong warehouse
- site, warehouse, batch, or serial dimensions do not match available stock
- picking or packing state has changed inventory availability
- negative inventory is disabled for the item model group or storage dimensions
- `InventTrans` is out of sync with the expected process state

After listing the standard branches, ask whether posting, reservation, or inventory validation has been customized.

## Web Search

Use web search only when AX 2009 standard-process details are genuinely uncertain and local evidence is not enough. Keep general process knowledge separate from customer-specific evidence.

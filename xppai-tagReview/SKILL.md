---
name: xppai-tagReview
description: Use when you have two XPO exports — an original (unmodified baseline) and an approved/tested version — and need to identify code changes and surround them with project code documentation tags, with confirmation per change. Never modifies business logic.
---

# XppAI TagReview — XPO Diff and Code Documentation Tag Inserter

**REQUIRED BACKGROUND:** Load `xppai-init` before applying this skill.

## Purpose

Compare two XPO exports to find what code changed, then wrap each changed block with project code documentation tags. Each tag insertion requires explicit user confirmation. No business logic is ever touched — only comment tags are added.

## What This Skill Does NOT Do

- Does not change, fix, refactor, or review any code
- Does not tag inside localization blocks (`<GBR>`, `<GIN>`, `<GJP>`, `<GSA>`, `<GTH>`)
- Does not double-tag code already wrapped in existing documentation tags
- Does not tag deleted lines (code gone from approved = nothing to wrap)

---

## Step 1 — Collect Inputs

Tag fields (prefix, project/US number, developer name) are collected **once per session** by `xppai-init`. Use those values — do not ask for them again.

Ask the user only for the two XPOs:

```
To begin the tag review, I need:
1. **Original XPO** — the unmodified baseline (paste it or provide the file path)
2. **Approved XPO** — the tested and approved version to be tagged (paste it or path)
```

If for any reason the session tag fields are missing, also ask for: tag prefix, US/project number, and developer name — but only if not already provided.

Do not proceed until both XPOs are provided.

Once provided, confirm:

```
Ready to compare:
- Original: [object name(s) detected]
- Approved: [object name(s) detected]
- Tag format: //<PREFIX - US_XXXXXX - DD/MM/YYYY - Developer Name>
```

---

## Step 2 — Parse and Identify Changed Methods

### XPO Object Structure

An XPO file contains one or more AOT objects separated by `***Element:` markers. Within each object, methods are delimited by:

```
METHOD #methodName
  ... method body ...
ENDMETHOD
```

Classes use `CLASS #` / `ENDCLASS`. Tables use `TABLE #` / `ENDTABLE`. Forms use `FORM #` / `ENDFORM`.

### Comparison Approach

1. Extract every method from the **original** XPO, keyed by `<ObjectName>::<methodName>`
2. Extract every method from the **approved** XPO, keyed the same way
3. Classify each method:

| Status | Condition |
|--------|-----------|
| **Unchanged** | Method exists in both; content identical |
| **Modified** | Method exists in both; content differs |
| **Added** | Method only in approved |
| **Deleted** | Method only in original |

4. **Unchanged methods** — skip entirely. No output.
5. **Deleted methods** — note them at the end of the session summary. Cannot be tagged (code is gone from approved).
6. **Added methods** — the entire method body is new; propose one tag wrapping the full body.
7. **Modified methods** — find the specific lines that changed (added or modified within the method). Group contiguous changed lines into a single tag block. Non-changed lines between two small changes that are fewer than 3 lines apart may be included in the same block for readability — use judgment.

---

## Step 3 — Confirmation Workflow

For each change block (in order of appearance in the approved XPO), present:

```
─────────────────────────────────────────────────────
Change [N of M] — <ObjectName>::<methodName> [MODIFIED | ADDED]
─────────────────────────────────────────────────────

CONTEXT (approved version, with proposed tags):

    [2–3 lines before the change for context]

    //<PREFIX - US_XXXXXX - DD/MM/YYYY - Developer Name>
    [changed lines exactly as they appear in approved XPO]
    //</PREFIX - US_XXXXXX - DD/MM/YYYY - Developer Name>

    [2–3 lines after the change for context]

Add this documentation tag? (yes / no / skip-all-in-method)
─────────────────────────────────────────────────────
```

- **yes** → mark this block as confirmed. Continue to next.
- **no** → skip this block. Mark as skipped in the summary.
- **skip-all-in-method** → skip all remaining blocks in the current method.

Do not apply any tags yet — collect all confirmations first, then produce output in Step 4.

### Special Cases — Auto-Skip (no confirmation needed)

These are flagged in the session summary but never presented for confirmation:

| Case | Why |
|------|-----|
| Changed line is inside a localization block (`// <GBR>` … `// </GBR>` etc.) | Localized code is out of scope |
| Changed lines already wrapped in an existing documentation tag (`//<PREFIX`) | Already documented |
| Whitespace-only change (spaces, blank lines, indentation) | Not a code change |
| Comment-only change (only `//` lines changed) | Not business logic |

---

## Step 4 — Output the Tagged XPO

After all confirmations are collected:

1. Start from the full approved XPO content (unchanged)
2. Insert confirmed documentation tags at the exact positions identified in Step 3
3. Output the complete final XPO

Format:

```
═══════════════════════════════════════════════════
 FINAL TAGGED XPO — [ObjectName]
═══════════════════════════════════════════════════

[full XPO content with confirmed documentation tags inserted]

═══════════════════════════════════════════════════
```

Then output the session summary:

```
─────────────────────────────────────────────────
 TAG REVIEW SUMMARY
─────────────────────────────────────────────────
Tagged:   [N] blocks confirmed and inserted
Skipped:  [N] blocks declined by user
Auto-skipped:
  - [N] localization blocks (out of scope)
  - [N] already tagged
  - [N] whitespace/comment-only changes
Deleted methods (cannot be tagged):
  - [list method names if any]
─────────────────────────────────────────────────
```

---

## Rules

- Never change any code — the approved XPO's business logic must be byte-for-byte identical to input except for the inserted documentation tag comment lines
- One tag block per contiguous changed region per method
- Tags go **inside** the method body, not wrapping the entire METHOD block
- If an entire method is new (Added), the tag wraps the full body: first line after the signature declaration through the last `}` before `ENDMETHOD`
- If confirmation is refused for all blocks in a method, the method appears untagged in output — that is correct behavior
- Do not invent changes. Only tag what the diff confirms.

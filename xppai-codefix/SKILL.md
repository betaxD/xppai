---
name: xppai-codefix
description: Use when proposing X++ AX 2009 code fixes for identified performance bottlenecks or behavioral bugs — minimal, production-safe changes that preserve business logic and fit ERP team review standards.
---

# XppAI Fix — X++ AX 2009 Safe Code Fix Generator

**REQUIRED BACKGROUND:** Load `xppai-init` before applying this skill.

## Overview

Specialist technique for generating the smallest effective X++ fix that solves an identified issue without unnecessary redesign, preserving business behavior and fitting AX 2009 coding conventions.

**Companion to:** `xppai-stack` (identifies the problem → this skill fixes it)

## Focus Areas

- Preserving existing business behavior — no silent semantic changes
- Reducing redundant work (move calc outside loop, cache find() result, defer refresh)
- Avoiding risky refactors unless the problem structurally requires them
- Fitting AX 2009 coding style (no modern patterns, no new architecture)
- Producing code a real ERP team can review, test, and merge

## Hard Constraint — Localized Code Is Off-Limits

**Never propose fixes inside localization blocks:**
`// <GBR>` `// </GBR>` `// <GIN>` `// </GIN>` `// <GJP>` `// </GJP>`
`// <GSA>` `// </GSA>` `// <GTH>` `// </GTH>` and equivalent patterns.

These blocks are owned by Microsoft/partner localization teams and must not be modified. If a problem originates inside a localization block, state **out of scope — localized code** and do not propose a fix.

## Rules

- Generate concrete X++ code when enough context exists
- If context is incomplete, state assumptions explicitly **before** the fix
- Prefer minimal diffs over broad rewrites
- Comments must be professional and implementation-oriented — no narrative
- Do not introduce new architecture unless truly required
- Do not change behavior silently — call out every semantic difference
- Always state risks, side effects, and what must be retested
- Use existing object and method structure whenever possible

## Mandatory Fix Metadata — Every Fix Must State

**1. Exact object location**
Always identify where the change goes. Never write "add this to the method" without naming the class, table, or form:

```
Object:  Class Tax
Method:  insertIntersection
Layer:   VAR (or CUS/USR — whichever applies)
```

**2. Signature change warning**
If the fix changes a method signature (adds/removes/renames parameters), it is a HIGH RISK change in AX 2009. Always:
- State explicitly: **"This is a signature change"**
- List all known subclasses that override this method — they must be updated too
- If subclasses are unknown, state: **"All subclasses overriding this method must be updated — verify in AOT before applying"**
- Never propose a signature change as a low-risk fix

```
⚠️ SIGNATURE CHANGE — affects all subclasses overriding this method.
Known overrides in this file: TaxPurch.insertIntersection
Unknown overrides: verify AOT → Tax → right-click → Add-ins → Used by
All overrides must receive the same parameter change.
```

**3. Code documentation tags**

Tag fields (prefix, project/US number, developer name) are collected **once per session** by `xppai-init` at session start.

- Use the values already collected — do NOT ask for them again here
- Do NOT ask for the full tag string — assemble it yourself from the collected fields
- Date is always the current system date in DD/MM/YYYY format
- If for any reason the session values are missing, ask for the three fields using the same format defined in `xppai-init`

Once collected, assemble and wrap all new or modified code:

```xpp
//<PREFIX - US_XXXXXX - DD/MM/YYYY - Developer Name>
// modified/added code here
//</PREFIX - US_XXXXXX - DD/MM/YYYY - Developer Name>
```

- Every block of changed code gets its own tag — do not tag unrelated surrounding code
- If the fix spans multiple methods or classes, each gets its own tag block

## Output Format

Always produce output in this exact structure:

```
1. Proposed Fix Summary
   One paragraph: what changes and what it preserves.

2. Assumptions
   Explicit list of what is assumed about the context not shown in evidence.
   If none: state "None — fix derived entirely from provided context."

3. Exact Code Change
   Always start with:
     Object: <ClassName / TableName / FormName>
     Method: <methodName>
     Signature change: Yes / No
     Tag required: Yes — //<PREFIX - US_XXXXX - DD/MM/YYYY - Name> / No
   Then: Before / After diff or inline replacement.
   AX 2009 compatible X++ only.
   Wrap all changed lines in SPS tags if applicable.

4. Why This Fix Is the Safest Option
   Why this is minimal, why alternatives were rejected.

5. Risks and Regression Points
   What could break, what depends on the changed code, what to retest.

6. Validation Checklist
   Concrete list: what to run, what to verify, what edge cases to cover.
```

## Code Generation Standards

```xpp
// AX 2009 compatible — no C# patterns, no modern X++ features
// Use existing class hierarchy — do not introduce new classes
// Variable declarations at top of method (AX 2009 style)
// Prefer find() with forupdate only when writing
// ttsBegin / ttsCommit scope must be as narrow as possible
// Never call calc() or refresh() inside a while select loop without justification
```

### TextIo Read Pattern (AX 2009)

`TextIo` in AX 2009 has **no `.eof()` method**. Always use `IO_Status::Ok` after `read()`:

```xpp
// WRONG — .eof() does not exist in AX 2009 TextIo
while (!csvImport.eof()) { ... }

// CORRECT — read first, then check status
csvRow = csvImport.read();
while (csvImport.status() == IO_Status::Ok)
{
    if (conLen(csvRow) == 0)
    {
        csvRow = csvImport.read();
        continue;
    }

    // process row...

    csvRow = csvImport.read();  // advance at end of each iteration
}
```

## Common Fix Patterns

| Problem | Safe Fix | Risk Level |
|---------|----------|------------|
| `Tax::calc()` called per line in loop | Defer to after loop; call once on header | Medium — verify tax totals |
| `SalesTable.find()` inside per-line loop | Cache result before loop | Low |
| `FormDataSource.refresh()` inside update | Move refresh to caller after all updates | Medium — verify UI state |
| Constructor `new X(...)` per iteration | Instantiate once before loop, reset state | Low–Medium |
| Totals recalc on every field change | Guard with changed-value check before recalc | Low |
| `while select` with no index hint | Add index or `firstOnly` where appropriate | Low |
| `select` inside loop with header-level filter | Move before loop — query is loop-invariant | Low |

### Loop-Invariant Query Pattern

**Signal:** A `select` inside a loop whose `where` clause filters only on header-level fields (fields that come from a parent record, not from the current iteration variable).

**Test:** Ask — does the filter value change between iterations? If no → move it before the loop.

```xpp
// BEFORE — select runs on every CSV row; salesTable.OperationId is fixed
while (!csvImport.eof())
{
    csvRow = csvImport.read();
    select firstOnly AssetIdMandatory from salesOperationType
        index hint SalesOperationIdx
        where salesOperationType.OperationId == salesTable.OperationId; // header-level — never changes
    assetIdMandatory = salesOperationType.AssetIdMandatory;
    ...
}

// AFTER — select runs once before loop
select firstOnly AssetIdMandatory from salesOperationType
    index hint SalesOperationIdx
    where salesOperationType.OperationId == salesTable.OperationId;
assetIdMandatory = salesOperationType.AssetIdMandatory;

while (!csvImport.eof())
{
    csvRow = csvImport.read();
    // assetIdMandatory already resolved
    ...
}
```

**Do NOT move if:**
- The filter references a field from the loop variable (e.g., `itemId`, `inventTransId`)
- The select checks accumulated state from previous iterations (duplicate checks must stay inside)
- The record being selected could be modified by a previous iteration

## Minimal Diff Example

```xpp
// BEFORE — Tax::calc() called per SalesParmLine iteration
while select salesParmLine
    where salesParmLine.ParmId == salesParm.ParmId
{
    taxCalc = Tax::newTrans(salesParmLine);  // expensive: constructor + calc per line
    taxCalc.calc();
    // process line...
}

// AFTER — defer calc to after loop; recalc totals once
while select salesParmLine
    where salesParmLine.ParmId == salesParm.ParmId
{
    // process line...
}
// Single recalc after all lines processed
salesParm.calcTax();
```

## Common Mistakes

| Mistake | Correct approach |
|---------|-----------------|
| Removing a `calc()` call entirely | Move it — never remove without confirming totals are recalculated elsewhere |
| Caching a `forupdate` record across iterations | Only cache read-only finds; forupdate must stay in loop scope |
| Moving `ttsBegin` outside a loop | Transaction scope change is a behavioral change — flag it explicitly |
| Adding `firstOnly` to a select that returns multiple rows | Verify cardinality first — wrong fix if multiple rows expected |
| Assuming refresh() removal is safe | Check if downstream display methods depend on the refresh signal |
| Proposing a signature change without checking subclasses | Always check AOT for overrides — every subclass that overrides must be updated |
| Writing fix code without documentation tags | All new/modified code must be wrapped in `//<PREFIX ...>` `//</PREFIX ...>` tags |
| Asking for the full tag string | Collect prefix, US number, and developer name separately — assemble the tag yourself |
| Saying "add to the method" without naming the object | Always name the exact class, table, or form and the method |

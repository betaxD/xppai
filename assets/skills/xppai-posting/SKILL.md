---
name: xppai-posting
description: Use when analyzing AX 2009 posting flows, document generation, FormLetter classes, journal creation, or any transactional framework behavior involving SalesFormLetter, PurchFormLetter, totals, tax, inventory, or ledger posting.
---

# XppAI Posting — AX 2009 Posting Flow Specialist

**REQUIRED BACKGROUND:** Load `xppai-init` before applying this skill.

## Overview

Specialist for AX 2009 posting flows — the most opaque and framework-driven part of the system. Makes posting flows understandable, debuggable, and safe to change without breaking the framework sequence.

## Scope

- `SalesFormLetter` / `PurchFormLetter` and their document-specific subclasses
- Confirmation, packing slip, invoice, product receipt flows
- Journal generation and voucher creation
- Totals and tax recalculation during posting
- Inventory movement and ledger interaction
- `PurchParmTable` / `PurchParmLine` / `SalesParmTable` / `SalesParmLine` population
- Custom hooks into standard posting flows

## Rules

- Stay specific to AX 2009 posting behavior — no generic ERP explanations
- Distinguish: **Framework behavior** | **Customization behavior** | **Business intent**
- Do not assume all side effects are explicit in the local code — framework does heavy hidden work
- Call out hidden framework work when likely
- Be explicit when the code shown is only part of the posting chain
- Prefer practical investigation guidance over vague explanation

## Standard AX 2009 Posting Chain (Purchase Invoice Example)

```
PurchFormLetter::construct(DocumentStatus::Invoice)
  → PurchFormLetter_Invoice.run()
    → PurchFormLetterParm.reArrangeNow()    ← populates PurchParmTable/PurchParmLine
      → PurchFormLetter_Invoice.post()
        → PurchCalcTax_Invoice (per line)   ← tax constructor + calc per line
          → InventMovement                  ← inventory deduction
            → LedgerVoucher                 ← accounting entries
              → VendInvoiceJour.insert()    ← document record created
                → PurchLine status update
                  → PurchTable status update
```

Each step is framework-managed. Customizations that break the sequence (e.g., committing early, skipping a method, wrong override point) cause silent data corruption.

## When Analyzing, Actively Identify

- Posting entry point (where does `run()` or `post()` begin?)
- Main framework objects involved
- Document or journal artifacts created or updated
- Transaction boundaries (`ttsBegin` scope in relation to posting steps)
- Totals/tax interactions (is `calcTax` called per line or per order?)
- Validation hooks (`validateWrite`, pre-post checks)
- Side effects on sales, purchase, inventory, ledger, document status
- Where customizations hook into standard flows (override, pre/post, direct modification)

## Output Format

Always produce output in this exact structure:

```
1. Executive Summary
   What posting scenario is this? What is the code doing in that context?

2. Posting Scenario Involved
   Which document flow: confirmation / packing slip / invoice / receipt / journal?
   Purchase or sales side?

3. Entry Point and Main Framework Path
   Where does control enter? What framework class drives it?
   Show the call chain as far as evidence allows.

4. Standard Framework Behavior Likely in Play
   What does the standard AX framework do here that may not be visible in this code?
   Flag hidden work: tax calc, inventory, ledger, status updates.

5. Customization Behavior Found Here
   What has been added or changed from standard behavior?
   Is the customization hooked correctly or fighting the framework?

6. Key Side Effects and Generated Artifacts
   What records are created, updated, or deleted?
   What journals, vouchers, or document records result?

7. Fragile or High-Risk Areas
   Where could a small change break the posting flow?
   Is the transaction scope correct? Is tax/totals called at the right level?

8. What to Inspect Next
   Which class, method, or table to read next.

9. Safe-Change Notes
   If a change is needed here, what must be preserved to avoid breaking the flow?
```

## Common Posting Fragility Patterns

| Pattern | Risk |
|---------|------|
| Custom code inside `FormLetter.run()` instead of an override | Breaks on standard upgrade or re-entrant call |
| `ttsCommit` inside a posting step before the full chain completes | Partial commit — inventory and ledger may be out of sync |
| Tax constructor called per line inside posting loop | O(n) cost — confirmed performance anti-pattern |
| `PurchLine.update()` called directly during posting | Bypasses framework status management |
| `refresh()` or `reread()` inside posting loop | UI operation in a server-side batch context |
| Status field set manually without going through status transition method | Leaves document in inconsistent state |

## Style

Clear. Technical. Framework-aware. ERP-sensitive. No fluff.

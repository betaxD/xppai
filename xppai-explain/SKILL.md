---
name: xppai-explain
description: Use when reading unfamiliar X++ AX 2009 code — methods, classes, forms, tables, or XPO extracts — to understand what it does, what triggers it, what it calls, and where it fits in the AX execution model.
---

# XppAI Explain — AX 2009 Code Explanation Specialist

**REQUIRED BACKGROUND:** Load `xppai-init` before applying this skill.

## Overview

Reads any AX 2009 artifact and explains it in terms a real teammate can act on: business purpose, technical role, execution entry points, downstream calls, side effects, and hidden complexity.

## Rules

- Stay grounded in the provided code — do not invent behavior
- Distinguish: **Confirmed behavior** (seen in code) | **Likely behavior** (inferred from AX patterns) | **Unknown** (context missing)
- Explain AX 2009 concepts in context, not as isolated theory
- Call out uncertainty when context is incomplete
- Make unfamiliar code readable without oversimplifying it

## When Analyzing, Actively Identify

- What object type this is (table, class, form, datasource, control)
- Whether logic is form-level, datasource-level, table-level, or class-level
- What standard AX lifecycle methods may trigger it
- What methods or flows are likely to call into it
- What other objects or records it affects
- Whether logic belongs in the current layer

## Output Format

Always produce output in this exact structure:

```
1. Executive Summary
   2-3 sentences: what this code does and why it matters.

2. Object Type and Role in AX 2009
   What kind of object is this? Where does it live in the AOT?
   What is its role in the form/table/class architecture?

3. What Triggers This Code
   What lifecycle event, user action, framework call, or caller invokes this?
   Is it called from a hot path (active, modifiedField, posting loop)?

4. Step-by-Step Behavior
   Walk through the logic in execution order.
   Explain each meaningful block — not line by line, but by intent.

5. What It Calls or Depends On
   List methods called, tables read, classes instantiated, framework objects used.
   Flag anything expensive, external, or framework-driven.

6. Side Effects and Hidden Behavior
   What does this change beyond its obvious output?
   Does it write to tables, trigger cascades, update UI state, or affect totals/tax?

7. Important Unknowns or Assumptions
   What context is missing? What would change the explanation if known?

8. What to Inspect Next
   Concrete: what method, caller, or object to read next to deepen understanding.
```

## Layer Quick Reference

| Object type | What triggers it | Where logic should live |
|-------------|-----------------|------------------------|
| Table `modifiedField` | Field change on form or code | Field defaulting, init from related table |
| Table `validateWrite` | Before every save | Validation only — no side effects |
| Form `active()` | Every record navigation | UI state only — no DB writes |
| Form `init()` | Once on open | Setup, caching, query config |
| Class `run()` | Called explicitly or from batch | Main business logic |
| FormLetter `run()` | Document posting trigger | Framework-managed — do not modify directly |

## Style

Clear. Technical. Practical. Teammate-friendly. No fluff.

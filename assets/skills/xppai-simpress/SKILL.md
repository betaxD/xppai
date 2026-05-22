---
name: xppai-simpress
description: Use when working with the Simpress company codebase — discovers and retrieves X++ source objects from the local XPO cache, then routes to standard xppai analysis skills.
---

# XppAI Simpress — Company Codebase Discovery

**Required background:** `xppai-core`  
**For deep analysis:** also load `xppai-domain`

Provides RAG-style access to the Simpress AX 2009 codebase. Uses the local XPO cache as the knowledge source and routes to standard `xppai` analysis skills after retrieving relevant objects.

## Prerequisites

The XPO cache must be loaded and session-authorized before analysis commands work.

Check cache state:
```
xppai xpo cache-show
```

If the cache is empty or missing, load all Simpress XPO files first:
```bash
xppai xpo load-dir <path-to-xpo-export-folder>
xppai xpo snapshot
```

The `load-dir` command recursively finds all `.xpo` files in the given directory, loads them into the local cache, and replaces any previous cache contents. Run `snapshot` after loading to authorize the session for `grep` and `read` operations.

## Discovery Workflow

Follow this sequence for every question about a Simpress object or feature.

### Step 1 — Keyword search
```bash
xppai xpo grep --contains <keyword> [--type Class|Table|Form|Query]
xppai xpo grep --contains <keyword> --limit 20
```
Use 2-3 targeted terms related to the object name or business concept. Narrow with `--type` if too many results.

### Step 2 — Read the object
```bash
xppai xpo read --type <Type> --name <ObjectName>
```
Read the most relevant match. After reading, set the intake state marker:  
`XPO intake already completed for this request`

### Step 3 — Route to analysis skill
Based on what the user needs:
- Understand code → `xppai-explain`
- Bug or fix → `xppai-codefix`
- Pre-change risk → `xppai-risk`
- Posting flow → `xppai-posting`
- Architecture → `xppai-architect`
- Full senior analysis → `xppai-papai`

## Multi-Object Questions

For questions spanning multiple objects (e.g., "how does purchase approval work?"):
1. Run up to 3 grep searches with different keywords
2. Read the 2-3 most relevant objects
3. Synthesize findings using `xppai-explain` or `xppai-papai`

Stop at 3 grep cycles before synthesizing to avoid excessive token use.

## Object Name Discovery

If the exact object name is unknown, use:
```bash
xppai xpo list --type Class
xppai xpo list --type Table
xppai xpo grep --contains Simpress
```

## Evidence Labels

Use canonical labels from `xppai-core`:
- `Confirmed` — code read directly from a retrieved object
- `Likely` — inferred from patterns or partial evidence
- `Hypothesis` — plausible but unverified
- `Unknown` — not found in the retrieved context

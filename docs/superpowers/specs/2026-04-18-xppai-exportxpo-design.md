# xppai-exportxpo — Design Spec

**Date:** 2026-04-18  
**Status:** Approved

## Summary

A new XppAI skill that generates a ready-to-paste X++ static job for exporting a list of AX 2009 AOT objects to XPO files. The user provides object names (as full AOT paths or `Type: Name` pairs), the skill resolves paths and outputs the complete job.

---

## Skill Identity

- **File:** `assets/skills/xppai-exportxpo/SKILL.md`
- **Name:** `xppai-exportxpo`
- **Description:** `Use when you need to export a list of AX 2009 AOT objects to XPO files — generates a ready-to-paste X++ job given object names or full AOT paths.`
- **Depends on:** nothing (`xppai-init` not required — this is a utility generator, not an analysis skill)

---

## Registry Updates

- `xppai-help`: add `xppai-exportxpo` row to the skills table
- `xppai-babysit`: add note — if user requests XPO export of analyzed objects, invoke `xppai-exportxpo`
- `xppai-papai`: add note — if user requests XPO export of analyzed objects, invoke `xppai-exportxpo`

---

## AOT Path Map

Built into the skill. Resolution rule: if input starts with `\`, use as-is. Otherwise look up prefix by type keyword and build `\Prefix\Name`.

| Type keyword | AOT prefix |
|---|---|
| `Class` | `\Classes` |
| `Table` | `\Data Dictionary\Tables` |
| `Map` | `\Data Dictionary\Maps` |
| `View` | `\Data Dictionary\Views` |
| `Enum` | `\Data Dictionary\Base Enums` |
| `EDT` | `\Data Dictionary\Extended Data Types` |
| `Form` | `\Forms` |
| `Query` | `\Queries` |
| `Report` | `\SSRS Reports\Reports` |
| `Job` | `\Jobs` |

---

## Behavior When Invoked

1. Read the user-provided list — any mix of full AOT paths (`\Classes\SalesFormLetter`) and `Type: Name` pairs (`Table: SalesLine`)
2. Resolve each entry to a full AOT path using the built-in map
3. Generate a single X++ static job with all resolved paths inserted into the `exportPaths` container literal
4. Output the complete job in a fenced code block — no surrounding prose

---

## Generated Job Structure

Structurally identical to the reference `PapaiExportXPO` template:

- `exportFolder` hardcoded to `C:\temp\xpo_export\`
- `exportPaths` container holds all resolved AOT paths
- Per-object loop: `TreeNode::findNode` → `FileIoPermission` → `treeNodeExport` → `info`/`warning`
- Final `info` summary: exported count, not-found count, folder path

---

## What the Skill Does NOT Do

- No input validation or normalization beyond path resolution
- No explanation prose around the generated code
- No "how to run" instructions
- Does not invoke `xppai-init` or any other skill

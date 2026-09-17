# xppAI AX 2012 Project Workspaces Design

## Purpose

Provide a lightweight, AX 2012-only workspace flow for organizing an individual AX change. The flow creates a named project folder, stores the minimum project metadata required for X++ documentation tags, and creates project documentation only when its respective stage begins.

This feature belongs exclusively to `packages/xppai-ax2012`. It must not change AX 2009 commands, skills, configuration, or behavior.

## Scope

The feature provides one AX 2012 project-workspace coordinator with two entry conditions:

1. A user has opened or selected an existing project folder in Codex.
2. A user asks to start from nothing; the coordinator asks for a folder name and creates it.

On first initialization, the coordinator asks for:

- the folder name, when it must create the root;
- `companyTag` (for example, `FGL`);
- `projectName`;
- `developerName`;
- a concise work objective.

The coordinator creates only the workspace root and `.xppai-ax2012.json`. It does not pre-create plans, reviews, technical documentation, functional documentation, test plans, AX artifacts, or background processes.

## Project Configuration

Each workspace contains one small, local configuration file:

```text
<project-folder>/
  .xppai-ax2012.json
```

The initial schema is intentionally limited:

```json
{
  "schemaVersion": 1,
  "companyTag": "FGL",
  "projectName": "NomeDoProjetoAX",
  "developerName": "t_robertaoliveira",
  "objective": "Short statement of the requested business change"
}
```

The current date is not configuration. New tags use the local date when the new code is created or changed.

These values are defaults for the complete project. A user may explicitly request a different value for a specific change; otherwise the coordinator reuses the configured values.

## X++ Documentation Tags

The canonical tag pair is:

```xpp
//<FGL workitem="NomeDoProjetoAX" date="17/09/2026" user="t_robertaoliveira">
// changed code
//</FGL workitem="NomeDoProjetoAX" date="17/09/2026" user="t_robertaoliveira">
```

Opening marker, source, and closing marker remain at the same indentation level. The literal syntax has no backslashes.

Rules:

- New classes receive one tag pair only around `classDeclaration`.
- New tables receive a tag pair around every newly created method.
- Altered existing code receives a pair around precisely the changed source range.
- When a source range already has tags for this workspace, its existing markers and their date remain unchanged.
- Existing tags from other developers are never removed or rewritten.
- Obsolete code is retained as commented source inside a new tag pair; it is not deleted.

## On-Demand Documentation

The coordinator creates a document only when the user begins that stage. Documents are English Markdown files in the workspace root:

| Stage | File | Minimum content |
| --- | --- | --- |
| Simplified planning | `action-plan.md` | Objective, direct steps, risks/assumptions |
| Code review | `code-review.md` | Scope, findings, disposition |
| Technical changes | `technical-changes.md` | Components changed, implementation notes, operational considerations |
| Functional summary | `functional-summary.md` | Business behavior, impacted users/processes, expected result |
| Test suggestion | `test-plan.md` | Suggested scenarios, expected outcomes, environment-dependent checks |

The coordinator creates or updates only the document for the requested stage. It does not generate all templates, perform global scanning, or retain a running process.

## Safety and Error Handling

Before modifying code, the coordinator locates the single workspace configuration and reads its metadata. If it is absent, it collects the initial values and creates the configuration. If the requested source boundary is ambiguous, markers overlap, or multiple workspace roots apply, it stops and asks for clarification. It never resolves ambiguity by deleting, reformatting, or moving source.

The feature offers project organization and code-documentation support only. AX compile, database synchronization, CIL, deployment, security, and live environment verification remain separate AX 2012 activities.

## Verification

Automated tests cover:

- initialization in an existing folder and creation from a requested folder name;
- minimal configuration creation and default reuse;
- each document being created only when its stage begins;
- current local date on a newly created tag;
- preservation of pre-existing tags for the workspace and for other developers;
- class declaration tagging, per-method table tagging, precise changed-range tagging, and obsolete-code commenting;
- ambiguous configuration or source boundaries stopping without modification.

Tests are package-local and do not require an AX 2012 instance. AX runtime validation, where applicable, is explicitly documented as a later environment-dependent check.

## Non-Goals

- No AX 2009 integration.
- No global project registry, database, daemon, background indexer, or automatic documentation generation.
- No replacement of the existing AX 2012 evidence, risk, review, or implementation workflows.
- No automatic deletion of legacy source or documentation tags.

# xppAI AX 2012 Project Workspaces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a lightweight AX 2012-only project workspace that initializes local configuration, creates only a requested stage document, and supplies deterministic X++ documentation-tag rules.

**Architecture:** All durable state lives in one `.xppai-ax2012.json` in the workspace root. Focused CommonJS modules own configuration, tag inspection/rendering, and lazy Markdown documents; a `project` CLI command exposes initialization and document creation, while an installed AX 2012 skill owns conversational prompts and safe tag application.

**Tech Stack:** Node.js >=18, CommonJS, `node:test`, `node:assert/strict`, synchronous local filesystem APIs, existing package-local CLI and asset installer.

**Spec:** `docs/superpowers/specs/2026-09-17-xppai-ax2012-project-workspaces-design.md`

## Global Constraints

- Implement only in `packages/xppai-ax2012`; do not change AX 2009 assets, commands, tests, configuration, or behavior.
- Add no dependency, global registry, database, background process, or eager document generation.
- Persist exactly `schemaVersion`, `companyTag`, `projectName`, `developerName`, and `objective`; date is never persisted.
- New markers are literal `//<...>` and `//</...>` with current local `dd/mm/yyyy` date and same-level indentation.
- Never rewrite or remove existing markers; malformed, overlapping, or ambiguous boundaries stop the workflow.
- Keep artifacts, diagnostics, identifiers, tests, and package documents in English.
- AX compilation, database sync, CIL, deployment, security, and runtime verification remain environment-dependent checks.
- Do not stage, revert, or absorb unrelated user edits, including current Ririchard worktree changes.

## File Structure

| Path | Responsibility |
| --- | --- |
| `src/project/config.js` | Validate, create, find, and read the one local configuration. |
| `src/project/tags.js` | Render tags and conservatively classify a source range without source mutation. |
| `src/project/documents.js` | Create one requested short Markdown document. |
| `src/commands/project.js` | Delegate scriptable `project init` and `project document` commands. |
| `src/cli.js` | Register the new top-level command. |
| `assets/skills/xppai-ax2012-project/SKILL.md` | Own conversational collection of missing values and AX-safe tag policy. |
| `assets/commands/xppai-ax2012-project.md` | Route an installed command to the project skill. |
| `README.md`, `docs/cli.md`, `docs/skills.md` | Describe the public package surface. |
| `test/project/*.test.js` | Test config, tags, documents, and no-mutation failures. |

## Task 1: Project configuration and tag primitives

**Files:**

- Create: `packages/xppai-ax2012/src/project/config.js`
- Create: `packages/xppai-ax2012/src/project/tags.js`
- Create: `packages/xppai-ax2012/test/project/config.test.js`
- Create: `packages/xppai-ax2012/test/project/tags.test.js`

**Interfaces:**

- Produces `CONFIG_FILE_NAME = '.xppai-ax2012.json'`.
- Produces `validateProjectConfig(value) -> { schemaVersion: 1, companyTag, projectName, developerName, objective }`.
- Produces `initializeProject({ root, config, createRoot }) -> { root, configPath, config }` and `findProjectConfig(startPath) -> { root, configPath, config } | null`.
- Produces `formatLocalDate(date) -> 'dd/mm/yyyy'`, `renderTagPair(config, date) -> { opening, closing }`, and `classifyTaggedRange(source, config) -> 'same-project' | 'other-project-or-developer' | 'untagged' | 'ambiguous'`.

- [ ] **Step 1: Write failing tests for configuration and tags**

```js
test('creates only the requested root and minimal project configuration', () => {
  const root = path.join(tempRoot, 'InvoiceSettlement');
  const result = initializeProject({ root, createRoot: true, config: validConfig });
  assert.equal(path.basename(result.configPath), '.xppai-ax2012.json');
  assert.deepEqual(result.config, { schemaVersion: 1, ...validConfig });
  assert.deepEqual(fs.readdirSync(root), ['.xppai-ax2012.json']);
});

test('renders matching current-date markers and preserves a prior project date', () => {
  assert.deepEqual(renderTagPair(validConfig, new Date(2026, 8, 17)), {
    opening: '//<FGL workitem="InvoiceSettlement" date="17/09/2026" user="t_robertaoliveira">',
    closing: '//</FGL workitem="InvoiceSettlement" date="17/09/2026" user="t_robertaoliveira">',
  });
  const oldRange = '//<FGL workitem="InvoiceSettlement" date="16/09/2026" user="t_robertaoliveira">\nx = 1;\n//</FGL workitem="InvoiceSettlement" date="16/09/2026" user="t_robertaoliveira">';
  assert.equal(classifyTaggedRange(oldRange, validConfig), 'same-project');
  assert.match(oldRange, /16\/09\/2026/);
});
```

Add cases for whitespace metadata, existing config, a file root, nearest-parent lookup, no workspace, leading-zero dates, other developers, and mismatched or overlapping pairs.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test test/project/config.test.js test/project/tags.test.js`

Working directory: `packages/xppai-ax2012`

Expected: FAIL because `src/project/config.js` and `src/project/tags.js` do not exist.

- [ ] **Step 3: Implement the minimal pure interfaces**

```js
const CONFIG_FILE_NAME = '.xppai-ax2012.json';

function validateProjectConfig(value) {
  for (const key of ['companyTag', 'projectName', 'developerName', 'objective']) {
    if (typeof value?.[key] !== 'string' || value[key].trim() === '') {
      throw new Error('project configuration requires non-empty ' + key);
    }
  }
  return Object.freeze({
    schemaVersion: 1,
    companyTag: value.companyTag.trim(),
    projectName: value.projectName.trim(),
    developerName: value.developerName.trim(),
    objective: value.objective.trim(),
  });
}
```

Use `fs.mkdirSync(root, { recursive: true })` only when `createRoot` is true; reject an existing config before writing UTF-8 JSON with a final newline. `findProjectConfig` walks supplied parents only. `classifyTaggedRange` is conservative and must not expose a source rewrite operation.

- [ ] **Step 4: Run focused tests to verify they pass**

Run: `node --test test/project/config.test.js test/project/tags.test.js`

Expected: PASS.

- [ ] **Step 5: Commit this self-contained deliverable**

```powershell
git add packages/xppai-ax2012/src/project/config.js packages/xppai-ax2012/src/project/tags.js packages/xppai-ax2012/test/project/config.test.js packages/xppai-ax2012/test/project/tags.test.js
git commit -m "feat(ax2012): add project workspace metadata"
```

## Task 2: Lazy stage documents

**Files:**

- Create: `packages/xppai-ax2012/src/project/documents.js`
- Create: `packages/xppai-ax2012/test/project/documents.test.js`

**Interfaces:**

- Consumes the validated configuration from Task 1.
- Produces `STAGE_FILES` with exactly `action-plan`, `code-review`, `technical-changes`, `functional-summary`, and `test-plan`.
- Produces `ensureStageDocument({ root, config, stage }) -> { path, created }`.

- [ ] **Step 1: Write failing lazy-document tests**

```js
test('creates only the requested short English document', () => {
  const result = ensureStageDocument({ root, config: validConfig, stage: 'action-plan' });
  assert.equal(path.basename(result.path), 'action-plan.md');
  assert.equal(result.created, true);
  assert.equal(fs.existsSync(path.join(root, 'code-review.md')), false);
  assert.match(fs.readFileSync(result.path, 'utf8'), /# Action Plan/);
});

test('does not rewrite an existing stage document or create an invalid stage', () => {
  assert.equal(ensureStageDocument({ root, config: validConfig, stage: 'action-plan' }).created, false);
  assert.throws(() => ensureStageDocument({ root, config: validConfig, stage: 'all' }), /stage/i);
});
```

Add one assertion per document for its minimum headings: direct steps/risks, review findings/disposition, technical components/operations, functional behavior/impact, and scenarios/expected outcomes.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/project/documents.test.js`

Working directory: `packages/xppai-ax2012`

Expected: FAIL because `src/project/documents.js` does not exist.

- [ ] **Step 3: Implement one-file-at-a-time generation**

```js
const STAGE_FILES = Object.freeze({
  'action-plan': 'action-plan.md',
  'code-review': 'code-review.md',
  'technical-changes': 'technical-changes.md',
  'functional-summary': 'functional-summary.md',
  'test-plan': 'test-plan.md',
});

function ensureStageDocument({ root, config, stage }) {
  const filename = STAGE_FILES[stage];
  if (!filename) throw new Error('project document requires a supported --stage');
  const target = path.join(root, filename);
  if (fs.existsSync(target)) return { path: target, created: false };
  fs.writeFileSync(target, renderDocument(stage, config), 'utf8');
  return { path: target, created: true };
}
```

`renderDocument` supplies concise English headings only. It includes the configured objective where relevant and creates no other stage files.

- [ ] **Step 4: Run focused tests to verify they pass**

Run: `node --test test/project/documents.test.js`

Expected: PASS.

- [ ] **Step 5: Commit this self-contained deliverable**

```powershell
git add packages/xppai-ax2012/src/project/documents.js packages/xppai-ax2012/test/project/documents.test.js
git commit -m "feat(ax2012): add workspace stage documents"
```

## Task 3: Scriptable project command

**Files:**

- Create: `packages/xppai-ax2012/src/commands/project.js`
- Modify: `packages/xppai-ax2012/src/cli.js`
- Modify: `packages/xppai-ax2012/test/cli/basic.test.js`
- Create: `packages/xppai-ax2012/test/cli/project.test.js`

**Interfaces:**

- Consumes `initializeProject`, `findProjectConfig`, and `ensureStageDocument`.
- Produces `projectCommand(flags, positionals, context)`.
- Exposes exactly:
  - `xppai-ax2012 project init --root <path> --company-tag <value> --project-name <value> --developer <value> --objective <value> [--create-root]`
  - `xppai-ax2012 project document --root <path> --stage <action-plan|code-review|technical-changes|functional-summary|test-plan>`

- [ ] **Step 1: Write failing command tests**

```js
test('project init creates a named root only with explicit create-root', () => {
  const root = path.join(tempRoot, 'InvoiceSettlement');
  const result = runCli([
    'project', 'init', '--root', root, '--create-root',
    '--company-tag', 'FGL', '--project-name', 'InvoiceSettlement',
    '--developer', 't_robertaoliveira', '--objective', 'Record settlement changes',
  ]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(path.join(root, '.xppai-ax2012.json')), true);
});

test('project document rejects an unknown stage without creating a file', () => {
  const result = runCli(['project', 'document', '--root', configuredRoot, '--stage', 'all']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /stage/i);
});
```

Add cases for missing init flags, missing configuration, successful `test-plan` generation, help including `project`, and existing root behavior without `--create-root`.

- [ ] **Step 2: Run the command tests to verify they fail**

Run: `node --test test/cli/basic.test.js test/cli/project.test.js`

Working directory: `packages/xppai-ax2012`

Expected: FAIL because `project` is not a top-level command.

- [ ] **Step 3: Implement the narrow dispatcher**

```js
function requireValue(flags, name) {
  const value = flags[name];
  if (!value || value === true) throw new Error('project requires ' + name);
  return String(value);
}

function projectCommand(flags, positionals) {
  if (positionals[0] === 'init') {
    return initializeProject({
      root: requireValue(flags, '--root'),
      createRoot: flags['--create-root'] === true,
      config: {
        companyTag: requireValue(flags, '--company-tag'),
        projectName: requireValue(flags, '--project-name'),
        developerName: requireValue(flags, '--developer'),
        objective: requireValue(flags, '--objective'),
      },
    });
  }
  if (positionals[0] === 'document') {
    const workspace = findProjectConfig(requireValue(flags, '--root'));
    if (!workspace) throw new Error('project document requires an existing workspace configuration');
    return ensureStageDocument({ root: workspace.root, config: workspace.config, stage: requireValue(flags, '--stage') });
  }
  throw new Error('unknown project operation; expected init or document');
}
```

Add `project` to `TOP_LEVEL_COMMANDS` and the handler map. The CLI never prompts interactively; it emits a non-zero diagnostic for missing values. The installed skill owns one-at-a-time questions, keeping command execution scriptable and low-resource.

- [ ] **Step 4: Run focused tests to verify they pass**

Run: `node --test test/cli/basic.test.js test/cli/project.test.js`

Expected: PASS.

- [ ] **Step 5: Commit this self-contained deliverable**

```powershell
git add packages/xppai-ax2012/src/commands/project.js packages/xppai-ax2012/src/cli.js packages/xppai-ax2012/test/cli/basic.test.js packages/xppai-ax2012/test/cli/project.test.js
git commit -m "feat(ax2012): add project workspace command"
```

## Task 4: Installed skill, public docs, and release gate

**Files:**

- Create: `packages/xppai-ax2012/assets/skills/xppai-ax2012-project/SKILL.md`
- Create: `packages/xppai-ax2012/assets/commands/xppai-ax2012-project.md`
- Modify: `packages/xppai-ax2012/src/constants.js`
- Modify: `packages/xppai-ax2012/README.md`
- Modify: `packages/xppai-ax2012/docs/cli.md`
- Modify: `packages/xppai-ax2012/docs/skills.md`
- Modify: `packages/xppai-ax2012/test/package/docs.test.js`
- Modify: `packages/xppai-ax2012/test/cli/basic.test.js`

**Interfaces:**

- Produces the public skill ID `xppai-ax2012-project` in `PUBLIC_SKILLS`.
- Produces an installed command that launches the project skill.
- Consumes the exact CLI surface from Task 3.

- [ ] **Step 1: Write failing public-contract tests**

```js
test('project skill is published with its documented CLI surface', () => {
  assert(PUBLIC_SKILLS.includes('xppai-ax2012-project'));
  assert.match(read('README.md'), /project init/i);
  assert.match(read('docs/cli.md'), /project document/i);
  assert.match(read('docs/skills.md'), /xppai-ax2012-project/);
  assert.match(read('assets/skills/xppai-ax2012-project/SKILL.md'), /classDeclaration/);
});
```

Require help and `list` to retain every existing public command and skill. Change any hard-coded public-skill count to calculate from `PUBLIC_SKILLS`.

- [ ] **Step 2: Run public-contract tests to verify they fail**

Run: `node --test test/package/docs.test.js test/cli/basic.test.js`

Working directory: `packages/xppai-ax2012`

Expected: FAIL because the project skill, command, and documentation do not exist.

- [ ] **Step 3: Create the installed skill and documentation**

The skill must require `xppai-ax2012-core`; locate the configuration; collect missing folder name (only for new root), company tag, project name, developer name, and objective one at a time; call `project init` with explicit flags; create a document only for the requested stage; preserve old tags; stop for overlap/ambiguity; and distinguish package checks from AX environment confirmation.

Document both `project` CLI operations and every stage in `docs/cli.md`. Add one concise workspace paragraph to `README.md` and list the new skill in `docs/skills.md`. Do not change the closed FGL-only Ririchard catalog: its current user-owned modifications are outside this feature.

- [ ] **Step 4: Run focused tests to verify they pass**

Run: `node --test test/package/docs.test.js test/cli/basic.test.js`

Expected: PASS.

- [ ] **Step 5: Commit this self-contained deliverable**

```powershell
git add packages/xppai-ax2012/assets/skills/xppai-ax2012-project/SKILL.md packages/xppai-ax2012/assets/commands/xppai-ax2012-project.md packages/xppai-ax2012/src/constants.js packages/xppai-ax2012/README.md packages/xppai-ax2012/docs/cli.md packages/xppai-ax2012/docs/skills.md packages/xppai-ax2012/test/package/docs.test.js packages/xppai-ax2012/test/cli/basic.test.js
git commit -m "feat(ax2012): publish project workspace skill"
```

- [ ] **Step 6: Run fresh package gates and review the final diff**

Run: `npm test; npm run verify:artifact; npm run verify:side-by-side; npm run verify:ax2009; npm run prepublishOnly`

Working directory: `packages/xppai-ax2012`

Expected: PASS. Then confirm from the final diff that AX 2009 is untouched, configuration stores no date, no helper rewrites source, only requested documents are created, current date is used only for new pairs, CLI is explicit/noninteractive, and no user-owned Ririchard edit is staged.

## Plan Self-Review

- Spec coverage: Task 1 covers root/configuration and safe tag primitives; Task 2 covers each lazy document; Task 3 makes the functionality scriptable; Task 4 publishes the Codex workflow and independently verifies the AX boundary.
- Placeholder scan: passed; every task has concrete paths, interfaces, commands, test assertions, and commit commands.
- Type consistency: Tasks 2-4 consume the exact configuration, tags, document, and command interfaces defined by Task 1.

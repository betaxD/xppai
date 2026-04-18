# xppai npm Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the xppai skill suite into a single npm-installable, LLM-runtime-agnostic package with a CLI and pluggable target adapters.

**Architecture:** Skill assets live under `assets/skills/` as the canonical source. A thin CLI (`bin/xppai.js` → `src/cli.js` → `src/commands/`) dispatches to target adapters (`src/targets/`). Each adapter implements a three-method contract (`resolveInstallDir`, `listOwnedEntries`, `export`). Shared filesystem primitives live in `src/fs.js`.

**Tech Stack:** Node.js >=18, CommonJS, no runtime dependencies, `node:test` + `node:assert` for tests.

**Spec:** `docs/superpowers/specs/2026-04-18-npm-package-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `assets/skills/xppai-*/SKILL.md` | Move (from root) | Canonical skill content |
| `package.json` | Create | npm manifest, bin entry, files list |
| `src/assets.js` | Create | `list()`, `path()` — discover packaged skills |
| `src/fs.js` | Create | `expandHome`, `ensureDir`, `copySkill`, `symlinkSkill`, `removeOwned` |
| `src/targets/index.js` | Create | `loadTarget(name)` registry |
| `src/targets/generic.js` | Create | Copy-as-is adapter, export-only |
| `src/targets/claude.js` | Create | Native adapter, installs to `~/.claude/skills` |
| `src/targets/codex.js` | Create | Native adapter, installs to `~/.agents/skills` |
| `src/targets/copilot.js` | Create | Transform adapter (SKILL.md → .md), export-only |
| `src/commands/list.js` | Create | `xppai list` handler |
| `src/commands/path.js` | Create | `xppai path` handler |
| `src/commands/export.js` | Create | `xppai export` handler |
| `src/commands/install.js` | Create | `xppai install` handler |
| `src/cli.js` | Create | argv parser + command dispatch |
| `bin/xppai.js` | Create | `#!/usr/bin/env node` entry point |
| `test/smoke.test.js` | Create | All smoke tests (written before implementation) |
| `CLAUDE.md` | Modify | Update structure docs |

---

## Task 1: Move skill assets into assets/skills/

**Files:**
- Move: `xppai-architect/` → `assets/skills/xppai-architect/`
- Move: `xppai-babysit/` → `assets/skills/xppai-babysit/`
- Move: `xppai-codefix/` → `assets/skills/xppai-codefix/`
- Move: `xppai-explain/` → `assets/skills/xppai-explain/`
- Move: `xppai-help/` → `assets/skills/xppai-help/`
- Move: `xppai-init/` → `assets/skills/xppai-init/`
- Move: `xppai-papai/` → `assets/skills/xppai-papai/`
- Move: `xppai-posting/` → `assets/skills/xppai-posting/`
- Move: `xppai-risk/` → `assets/skills/xppai-risk/`
- Move: `xppai-stack/` → `assets/skills/xppai-stack/`

- [ ] **Step 1: Create the assets/skills/ directory and move all skill directories**

```bash
mkdir -p assets/skills
for d in xppai-architect xppai-babysit xppai-codefix xppai-explain xppai-help xppai-init xppai-papai xppai-posting xppai-risk xppai-stack; do
  git mv "$d" "assets/skills/$d"
done
```

- [ ] **Step 2: Verify the move**

```bash
ls assets/skills/
```

Expected output (10 entries):
```
xppai-architect  xppai-babysit  xppai-codefix  xppai-explain  xppai-help
xppai-init  xppai-papai  xppai-posting  xppai-risk  xppai-stack
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: move skill assets into assets/skills/

Co-Authored-By: Roberta Freitas <roberta.freitas90@gmail.com>
EOF
)"
```

---

## Task 2: Create package.json

**Files:**
- Create: `package.json`

- [ ] **Step 1: Create package.json**

Create `package.json` at the repo root:

```json
{
  "name": "xppai",
  "version": "0.1.0",
  "description": "LLM-runtime-agnostic X++ AX 2009 skill suite",
  "license": "MIT",
  "bin": { "xppai": "./bin/xppai.js" },
  "files": ["assets/", "bin/", "src/"],
  "type": "commonjs",
  "scripts": {
    "test": "node --test test/smoke.test.js"
  },
  "engines": { "node": ">=18" }
}
```

- [ ] **Step 2: Verify it parses**

```bash
node -e "const p = require('./package.json'); console.log(p.name, p.version)"
```

Expected:
```
xppai 0.1.0
```

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "$(cat <<'EOF'
chore: add package.json

Co-Authored-By: Roberta Freitas <roberta.freitas90@gmail.com>
EOF
)"
```

---

## Task 3: Write test/smoke.test.js (all categories, before implementation)

**Files:**
- Create: `test/smoke.test.js`

- [ ] **Step 1: Create the test file**

Create `test/smoke.test.js`:

```js
'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const BIN = path.join(__dirname, '..', 'bin', 'xppai.js');
const EXPECTED_SKILLS = [
  'xppai-architect',
  'xppai-babysit',
  'xppai-codefix',
  'xppai-explain',
  'xppai-help',
  'xppai-init',
  'xppai-papai',
  'xppai-posting',
  'xppai-risk',
  'xppai-stack',
];

// ── Category 1: CLI smoke ─────────────────────────────────────────────────────

test('cli: xppai list exits 0 and prints all skill names', () => {
  const out = execFileSync(process.execPath, [BIN, 'list'], { encoding: 'utf8' });
  const lines = out.trim().split('\n').sort();
  assert.deepEqual(lines, EXPECTED_SKILLS);
});

test('cli: xppai path exits 0 and prints an existing path', () => {
  const out = execFileSync(process.execPath, [BIN, 'path'], { encoding: 'utf8' });
  const p = out.trim();
  assert.ok(p.length > 0, 'path is empty');
  assert.ok(fs.existsSync(p), `path does not exist: ${p}`);
});

// ── Category 2: Asset discovery ───────────────────────────────────────────────

test('assets.list() returns all 10 skills in sorted order', () => {
  const assets = require('../src/assets');
  assert.deepEqual(assets.list(), EXPECTED_SKILLS);
});

test('assets.path() returns a directory that exists on disk', () => {
  const assets = require('../src/assets');
  const p = assets.path();
  assert.ok(typeof p === 'string' && p.length > 0);
  assert.ok(fs.existsSync(p), `assets.path() does not exist: ${p}`);
});

// ── Category 3: Adapter contract shape ───────────────────────────────────────

const ADAPTER_NAMES = ['claude', 'codex', 'copilot', 'generic'];
const INSTALLABLE = new Set(['claude', 'codex']);

for (const name of ADAPTER_NAMES) {
  test(`adapter ${name}: exports required methods`, () => {
    const adapter = require(`../src/targets/${name}`);
    assert.equal(typeof adapter.id, 'string', 'id must be a string');
    assert.ok(adapter.id.length > 0, 'id must be non-empty');
    assert.equal(typeof adapter.resolveInstallDir, 'function', 'resolveInstallDir must be a function');
    assert.equal(typeof adapter.listOwnedEntries, 'function', 'listOwnedEntries must be a function');
    assert.equal(typeof adapter.export, 'function', 'export must be a function');
  });

  test(`adapter ${name}: resolveInstallDir returns ${INSTALLABLE.has(name) ? 'a string' : 'null'}`, () => {
    const adapter = require(`../src/targets/${name}`);
    const result = adapter.resolveInstallDir({});
    if (INSTALLABLE.has(name)) {
      assert.equal(typeof result, 'string', `${name}.resolveInstallDir() must return a string`);
      assert.ok(result.length > 0, `${name}.resolveInstallDir() must return a non-empty string`);
    } else {
      assert.equal(result, null, `${name}.resolveInstallDir() must return null`);
    }
  });
}

// ── Category 4: Generic export to temp dir ────────────────────────────────────

test('generic adapter: exports correct entries and is idempotent', () => {
  const adapter = require('../src/targets/generic');
  const assets = require('../src/assets');
  const skillsDir = assets.path();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xppai-smoke-'));

  try {
    // First export
    adapter.export(skillsDir, tempDir, { mode: 'copy' });

    const owned = adapter.listOwnedEntries(skillsDir);
    const actual = fs.readdirSync(tempDir).sort();
    assert.deepEqual(actual, [...owned].sort(), 'exported entries must exactly match listOwnedEntries()');

    // Each SKILL.md must be non-empty
    for (const name of owned) {
      const skillFile = path.join(tempDir, name, 'SKILL.md');
      assert.ok(fs.existsSync(skillFile), `SKILL.md missing for ${name}`);
      const content = fs.readFileSync(skillFile, 'utf8');
      assert.ok(content.length > 0, `SKILL.md is empty for ${name}`);
    }

    // Capture content before second export
    const contentBefore = {};
    for (const name of owned) {
      contentBefore[name] = fs.readFileSync(path.join(tempDir, name, 'SKILL.md'), 'utf8');
    }

    // Second export (idempotent)
    adapter.export(skillsDir, tempDir, { mode: 'copy' });

    const actual2 = fs.readdirSync(tempDir).sort();
    assert.deepEqual(actual2, [...owned].sort(), 'second export must produce same entries');

    for (const name of owned) {
      const contentAfter = fs.readFileSync(path.join(tempDir, name, 'SKILL.md'), 'utf8');
      assert.equal(contentAfter, contentBefore[name], `${name}/SKILL.md content changed on re-export`);
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run the tests — expect failures (modules not yet implemented)**

```bash
node --test test/smoke.test.js
```

Expected: exit code non-zero, errors about missing modules (`Cannot find module '../src/assets'`, etc.). This confirms the tests are real and will drive the implementation.

- [ ] **Step 3: Commit**

```bash
git add test/smoke.test.js
git commit -m "$(cat <<'EOF'
test: add smoke test suite (red — modules not yet implemented)

Co-Authored-By: Roberta Freitas <roberta.freitas90@gmail.com>
EOF
)"
```

---

## Task 4: Implement src/assets.js

**Files:**
- Create: `src/assets.js`

- [ ] **Step 1: Create src/assets.js**

```js
'use strict';

const nodePath = require('path');
const fs = require('fs');

function skillsDir() {
  return nodePath.join(__dirname, '..', 'assets', 'skills');
}

function list() {
  const dir = skillsDir();
  return fs.readdirSync(dir)
    .filter(name => fs.statSync(nodePath.join(dir, name)).isDirectory())
    .sort();
}

function assetPath() {
  return skillsDir();
}

module.exports = { list, path: assetPath };
```

- [ ] **Step 2: Run tests — Category 2 should now pass**

```bash
node --test test/smoke.test.js
```

Expected: the two `assets.*` tests pass. All other tests still fail (modules not yet implemented).

- [ ] **Step 3: Commit**

```bash
git add src/assets.js
git commit -m "$(cat <<'EOF'
feat: add src/assets.js (list, path)

Co-Authored-By: Roberta Freitas <roberta.freitas90@gmail.com>
EOF
)"
```

---

## Task 5: Implement src/fs.js

**Files:**
- Create: `src/fs.js`

- [ ] **Step 1: Create src/fs.js**

```js
'use strict';

const fs = require('fs');
const nodePath = require('path');
const os = require('os');

function expandHome(p) {
  if (typeof p === 'string' && p.startsWith('~')) {
    return nodePath.join(os.homedir(), p.slice(1));
  }
  return p;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copySkill(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src)) {
    const srcPath = nodePath.join(src, entry);
    const destPath = nodePath.join(dest, entry);
    if (fs.statSync(srcPath).isDirectory()) {
      copySkill(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function symlinkSkill(src, dest) {
  const type = process.platform === 'win32' ? 'junction' : 'dir';
  fs.symlinkSync(src, dest, type);
}

function removeOwned(dir, entries) {
  for (const entry of entries) {
    const entryPath = nodePath.join(dir, entry);
    if (!fs.existsSync(entryPath)) continue;
    fs.rmSync(entryPath, { recursive: true, force: true });
  }
}

module.exports = { expandHome, ensureDir, copySkill, symlinkSkill, removeOwned };
```

- [ ] **Step 2: Verify it loads without error**

```bash
node -e "const f = require('./src/fs'); console.log(Object.keys(f))"
```

Expected:
```
[ 'expandHome', 'ensureDir', 'copySkill', 'symlinkSkill', 'removeOwned' ]
```

- [ ] **Step 3: Commit**

```bash
git add src/fs.js
git commit -m "$(cat <<'EOF'
feat: add src/fs.js (filesystem helpers)

Co-Authored-By: Roberta Freitas <roberta.freitas90@gmail.com>
EOF
)"
```

---

## Task 6: Implement src/targets/generic.js and src/targets/index.js

**Files:**
- Create: `src/targets/generic.js`
- Create: `src/targets/index.js`

- [ ] **Step 1: Create src/targets/generic.js**

```js
'use strict';

const nodePath = require('path');
const fs = require('fs');
const fsHelpers = require('../fs');

module.exports = {
  id: 'generic',

  resolveInstallDir(_opts) {
    return null;
  },

  listOwnedEntries(skillsDir) {
    return fs.readdirSync(skillsDir)
      .filter(name => fs.statSync(nodePath.join(skillsDir, name)).isDirectory())
      .sort();
  },

  export(skillsDir, outDir, opts = {}) {
    const mode = (opts && opts.mode) || 'copy';
    const owned = this.listOwnedEntries(skillsDir);
    fsHelpers.ensureDir(outDir);
    fsHelpers.removeOwned(outDir, owned);
    for (const name of owned) {
      const src = nodePath.join(skillsDir, name);
      const dest = nodePath.join(outDir, name);
      if (mode === 'symlink') {
        fsHelpers.symlinkSkill(src, dest);
      } else {
        fsHelpers.copySkill(src, dest);
      }
    }
  },
};
```

- [ ] **Step 2: Create src/targets/index.js**

```js
'use strict';

const TARGETS = {
  claude:  require('./claude'),
  codex:   require('./codex'),
  copilot: require('./copilot'),
  generic: require('./generic'),
};

function loadTarget(name) {
  const adapter = TARGETS[name];
  if (!adapter) {
    process.stderr.write(
      `error: unknown target "${name}"\nvalid targets: ${Object.keys(TARGETS).join(', ')}\n`
    );
    process.exit(1);
  }
  return adapter;
}

module.exports = { loadTarget, TARGETS };
```

Note: `index.js` requires `claude`, `codex`, and `copilot` which do not exist yet. The tests that import `index.js` will fail until Task 7. That is expected.

- [ ] **Step 3: Run tests — Category 4 should now pass; Category 3 (generic) should pass**

```bash
node --test test/smoke.test.js
```

Expected: `adapter generic: exports required methods`, `adapter generic: resolveInstallDir returns null`, and `generic adapter: exports correct entries and is idempotent` all pass. Other adapter tests and CLI tests still fail.

- [ ] **Step 4: Commit**

```bash
git add src/targets/generic.js src/targets/index.js
git commit -m "$(cat <<'EOF'
feat: add generic adapter and targets registry

Co-Authored-By: Roberta Freitas <roberta.freitas90@gmail.com>
EOF
)"
```

---

## Task 7: Implement src/targets/claude.js, codex.js, copilot.js

**Files:**
- Create: `src/targets/claude.js`
- Create: `src/targets/codex.js`
- Create: `src/targets/copilot.js`

- [ ] **Step 1: Create src/targets/claude.js**

```js
'use strict';

const os = require('os');
const nodePath = require('path');
const generic = require('./generic');

module.exports = {
  id: 'claude',

  resolveInstallDir(_opts) {
    return nodePath.join(os.homedir(), '.claude', 'skills');
  },

  listOwnedEntries(skillsDir) {
    return generic.listOwnedEntries(skillsDir);
  },

  export(skillsDir, outDir, opts = {}) {
    return generic.export(skillsDir, outDir, opts);
  },
};
```

- [ ] **Step 2: Create src/targets/codex.js**

```js
'use strict';

const os = require('os');
const nodePath = require('path');
const generic = require('./generic');

module.exports = {
  id: 'codex',

  resolveInstallDir(_opts) {
    return nodePath.join(os.homedir(), '.agents', 'skills');
  },

  listOwnedEntries(skillsDir) {
    return generic.listOwnedEntries(skillsDir);
  },

  export(skillsDir, outDir, opts = {}) {
    return generic.export(skillsDir, outDir, opts);
  },
};
```

- [ ] **Step 3: Create src/targets/copilot.js**

```js
'use strict';

const nodePath = require('path');
const fs = require('fs');
const fsHelpers = require('../fs');

function stripFrontmatter(content) {
  if (!content.startsWith('---')) return content;
  const end = content.indexOf('\n---', 3);
  if (end === -1) return content;
  return content.slice(end + 4).trimStart();
}

module.exports = {
  id: 'copilot',

  resolveInstallDir(_opts) {
    return null;
  },

  listOwnedEntries(skillsDir) {
    return fs.readdirSync(skillsDir)
      .filter(name => fs.statSync(nodePath.join(skillsDir, name)).isDirectory())
      .map(name => `${name}.md`)
      .sort();
  },

  export(skillsDir, outDir, _opts = {}) {
    const owned = this.listOwnedEntries(skillsDir);
    fsHelpers.ensureDir(outDir);
    fsHelpers.removeOwned(outDir, owned);

    const skillDirs = fs.readdirSync(skillsDir)
      .filter(name => fs.statSync(nodePath.join(skillsDir, name)).isDirectory())
      .sort();

    for (const name of skillDirs) {
      const skillFile = nodePath.join(skillsDir, name, 'SKILL.md');
      const content = fs.readFileSync(skillFile, 'utf8');
      fs.writeFileSync(nodePath.join(outDir, `${name}.md`), stripFrontmatter(content));
    }
  },
};
```

- [ ] **Step 4: Run tests — Category 3 should now fully pass**

```bash
node --test test/smoke.test.js
```

Expected: all Category 2, 3, and 4 tests pass. Only Category 1 (CLI) tests still fail.

- [ ] **Step 5: Commit**

```bash
git add src/targets/claude.js src/targets/codex.js src/targets/copilot.js
git commit -m "$(cat <<'EOF'
feat: add claude, codex, and copilot target adapters

Co-Authored-By: Roberta Freitas <roberta.freitas90@gmail.com>
EOF
)"
```

---

## Task 8: Implement src/commands/

**Files:**
- Create: `src/commands/list.js`
- Create: `src/commands/path.js`
- Create: `src/commands/export.js`
- Create: `src/commands/install.js`

- [ ] **Step 1: Create src/commands/list.js**

```js
'use strict';

const assets = require('../assets');

module.exports = function list(_args) {
  process.stdout.write(assets.list().join('\n') + '\n');
};
```

- [ ] **Step 2: Create src/commands/path.js**

```js
'use strict';

const assets = require('../assets');

module.exports = function pathCmd(_args) {
  process.stdout.write(assets.path() + '\n');
};
```

- [ ] **Step 3: Create src/commands/export.js**

```js
'use strict';

const assets = require('../assets');
const { loadTarget } = require('../targets');

module.exports = function exportCmd(args) {
  const target = args['--target'];
  const outDir = args['--out'];

  if (!target) {
    process.stderr.write('error: --target is required\n');
    process.exit(1);
  }
  if (!outDir) {
    process.stderr.write('error: --out is required\n');
    process.exit(1);
  }

  const adapter = loadTarget(target);
  const mode = args['--mode'] || 'copy';
  adapter.export(assets.path(), outDir, { mode });
  process.stdout.write(`exported to ${outDir}\n`);
};
```

- [ ] **Step 4: Create src/commands/install.js**

```js
'use strict';

const assets = require('../assets');
const { loadTarget } = require('../targets');

module.exports = function install(args) {
  const target = args['--target'];

  if (!target) {
    process.stderr.write('error: --target is required\n');
    process.exit(1);
  }

  const adapter = loadTarget(target);
  const installDir = adapter.resolveInstallDir(args);

  if (!installDir) {
    process.stderr.write(
      `error: target "${target}" does not define a default install location\n` +
      `use "xppai export --target ${target} --out <dir>" instead\n`
    );
    process.exit(1);
  }

  const mode = args['--mode'] || 'copy';
  adapter.export(assets.path(), installDir, { mode });
  process.stdout.write(`installed to ${installDir}\n`);
};
```

- [ ] **Step 5: Verify all four modules load**

```bash
node -e "
require('./src/commands/list');
require('./src/commands/path');
require('./src/commands/export');
require('./src/commands/install');
console.log('all commands load OK');
"
```

Expected:
```
all commands load OK
```

- [ ] **Step 6: Commit**

```bash
git add src/commands/
git commit -m "$(cat <<'EOF'
feat: add src/commands/ (list, path, export, install)

Co-Authored-By: Roberta Freitas <roberta.freitas90@gmail.com>
EOF
)"
```

---

## Task 9: Implement src/cli.js

**Files:**
- Create: `src/cli.js`

- [ ] **Step 1: Create src/cli.js**

```js
'use strict';

const COMMANDS = {
  list:    require('./commands/list'),
  path:    require('./commands/path'),
  export:  require('./commands/export'),
  install: require('./commands/install'),
};

function parseArgs(argv) {
  const args = {};
  let command = null;
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (!command && !arg.startsWith('-')) {
      command = arg;
    } else if (arg.startsWith('--')) {
      const next = argv[i + 1];
      args[arg] = (next !== undefined && !next.startsWith('--')) ? next : true;
      if (next !== undefined && !next.startsWith('--')) i++;
    }
    i++;
  }
  return { command, args };
}

function run(argv) {
  const { command, args } = parseArgs(argv.slice(2));
  const handler = COMMANDS[command];
  if (!handler) {
    const valid = Object.keys(COMMANDS).join(', ');
    process.stderr.write(
      `error: unknown command "${command}"\n` +
      `valid commands: ${valid}\n` +
      `usage: xppai <command> [options]\n`
    );
    process.exit(1);
  }
  handler(args);
}

module.exports = { run };
```

- [ ] **Step 2: Verify it loads**

```bash
node -e "const cli = require('./src/cli'); console.log(typeof cli.run)"
```

Expected:
```
function
```

- [ ] **Step 3: Commit**

```bash
git add src/cli.js
git commit -m "$(cat <<'EOF'
feat: add src/cli.js (argv parser and command dispatch)

Co-Authored-By: Roberta Freitas <roberta.freitas90@gmail.com>
EOF
)"
```

---

## Task 10: Implement bin/xppai.js and verify full test suite

**Files:**
- Create: `bin/xppai.js`

- [ ] **Step 1: Create bin/xppai.js**

```js
#!/usr/bin/env node
'use strict';
require('../src/cli').run(process.argv);
```

- [ ] **Step 2: Make it executable (required on POSIX; harmless on Windows)**

```bash
chmod +x bin/xppai.js
```

- [ ] **Step 3: Run the full test suite — all tests should now pass**

```bash
node --test test/smoke.test.js
```

Expected: all tests pass, exit code 0. Output will show each test name with a checkmark.

- [ ] **Step 4: Manually verify the two CLI commands**

```bash
node bin/xppai.js list
```

Expected (10 lines, one skill name each):
```
xppai-architect
xppai-babysit
xppai-codefix
xppai-explain
xppai-help
xppai-init
xppai-papai
xppai-posting
xppai-risk
xppai-stack
```

```bash
node bin/xppai.js path
```

Expected: an absolute path ending in `assets/skills` that exists on disk.

- [ ] **Step 5: Commit**

```bash
git add bin/xppai.js
git commit -m "$(cat <<'EOF'
feat: add bin/xppai.js — all smoke tests passing

Co-Authored-By: Roberta Freitas <roberta.freitas90@gmail.com>
EOF
)"
```

---

## Task 11: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update the Development Workflow section in CLAUDE.md**

Replace the "Development Workflow" section with:

```markdown
## Development Workflow

```bash
node --test test/smoke.test.js   # run tests
node bin/xppai.js list           # list bundled skills
node bin/xppai.js path           # print assets/skills/ path
node bin/xppai.js export --target generic --out ./out  # export to a dir
node bin/xppai.js install --target claude              # install to ~/.claude/skills
```

Skills are plain Markdown files — edit `assets/skills/<name>/SKILL.md` directly. No build step.
```

- [ ] **Step 2: Update the Architecture section to reflect the new layout**

Replace the Architecture section to show the npm package structure (bin/, src/commands/, src/targets/, assets/skills/) instead of the old root-level skill directory layout.

Full updated Architecture section:

```markdown
## Architecture

### Package structure

```
assets/skills/          ← canonical SKILL.md source (one dir per skill)
bin/xppai.js            ← CLI entry point (#!/usr/bin/env node)
src/assets.js           ← list(), path() — discovers packaged skills
src/fs.js               ← filesystem helpers (copy, symlink, ensureDir, removeOwned)
src/cli.js              ← argv parser + command dispatch
src/commands/           ← one file per CLI command (list, path, export, install)
src/targets/            ← one adapter per runtime (claude, codex, copilot, generic)
test/smoke.test.js      ← smoke tests (node:test, no dependencies)
```

### Adapter contract

Every file in `src/targets/` exports:

```js
module.exports = {
  id: String,
  resolveInstallDir(opts),    // returns install path string, or null if export-only
  listOwnedEntries(skillsDir), // returns exact array of entry names this adapter writes
  export(skillsDir, outDir, opts)
}
```

`install` calls `resolveInstallDir`. If it returns `null`, the command fails with a message directing the user to `export --out` instead.

`export` removes only adapter-owned entries (from `listOwnedEntries`) before writing — unrelated files in the target directory are never touched.

### Installable vs export-only targets

| Target | Installable | Default location |
|---|---|---|
| `claude` | yes | `~/.claude/skills` |
| `codex` | yes | `~/.agents/skills` |
| `copilot` | no | use `--out` |
| `generic` | no | use `--out` |
```

- [ ] **Step 3: Run tests to confirm nothing broke**

```bash
node --test test/smoke.test.js
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
docs: update CLAUDE.md for npm package structure

Co-Authored-By: Roberta Freitas <roberta.freitas90@gmail.com>
EOF
)"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All spec sections have a corresponding task — assets (T1), package.json (T2), smoke tests (T3), assets.js (T4), fs.js (T5), generic + index (T6), claude/codex/copilot (T7), commands (T8), cli (T9), bin (T10), CLAUDE.md (T11).
- [x] **Placeholder scan:** No TBDs, TODOs, or vague steps. Every code step shows complete file contents.
- [x] **Type consistency:** `listOwnedEntries(skillsDir)` used consistently across T6, T7, and in smoke test (T3). `resolveInstallDir(opts)` consistent across all adapter definitions and the `install` command (T8). `loadTarget` defined in T6 (`targets/index.js`) and consumed in T8 (`commands/export.js`, `commands/install.js`).
- [x] **Ownership rule:** `removeOwned` in `fs.js` (T5) takes `(dir, entries)` — matches usage in `generic.export` (T6) which passes `this.listOwnedEntries(skillsDir)`. Also used in `copilot.export` (T7). Consistent.
- [x] **No writes to home directories in tests:** Category 4 uses `os.tmpdir()`, not `os.homedir()`. Confirmed.

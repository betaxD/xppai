'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const nodePath = require('path');

const ADAPTER_NAMES = ['claude', 'codex', 'qwen', 'copilot', 'generic'];
const INSTALLABLE = new Set(['claude', 'codex', 'qwen', 'copilot']);

for (const name of ADAPTER_NAMES) {
  test(`adapter ${name}: exports required methods`, () => {
    const adapter = require(`../../src/targets/${name}`);
    assert.equal(typeof adapter.id, 'string', 'id must be a string');
    assert.ok(adapter.id.length > 0, 'id must be non-empty');
    assert.equal(typeof adapter.resolveInstallDir, 'function', 'resolveInstallDir must be a function');
    assert.equal(typeof adapter.listOwnedEntries, 'function', 'listOwnedEntries must be a function');
    assert.equal(typeof adapter.export, 'function', 'export must be a function');
  });

  test(`adapter ${name}: resolveInstallDir returns ${INSTALLABLE.has(name) ? 'a string' : 'null'}`, () => {
    const adapter = require(`../../src/targets/${name}`);
    const result = adapter.resolveInstallDir({});
    if (INSTALLABLE.has(name)) {
      assert.equal(typeof result, 'string', `${name}.resolveInstallDir() must return a string`);
      assert.ok(result.length > 0, `${name}.resolveInstallDir() must return a non-empty string`);
    } else {
      assert.equal(result, null, `${name}.resolveInstallDir() must return null`);
    }
  });
}

test('adapter codex: installs into ~/.codex/skills', () => {
  const adapter = require('../../src/targets/codex');
  const result = adapter.resolveInstallDir({});
  assert.equal(
    result,
    nodePath.join(require('os').homedir(), '.codex', 'skills'),
    'codex.resolveInstallDir() must target ~/.codex/skills'
  );
});

test('adapter claude: installs into ~/.claude/skills', () => {
  const adapter = require('../../src/targets/claude');
  const result = adapter.resolveInstallDir({});
  assert.equal(
    result,
    nodePath.join(require('os').homedir(), '.claude', 'skills'),
    'claude.resolveInstallDir() must target ~/.claude/skills'
  );
});

test('adapter qwen: installs into ~/.qwen/skills', () => {
  const adapter = require('../../src/targets/qwen');
  const result = adapter.resolveInstallDir({});
  assert.equal(
    result,
    nodePath.join(require('os').homedir(), '.qwen', 'skills'),
    'qwen.resolveInstallDir() must target ~/.qwen/skills'
  );
});

test('adapter copilot: installs into the current repository .github/skills directory', () => {
  const adapter = require('../../src/targets/copilot');
  const result = adapter.resolveInstallDir({});
  assert.equal(
    result,
    nodePath.join(process.cwd(), '.github', 'skills'),
    'copilot.resolveInstallDir() must target the current repository .github/skills directory'
  );
});

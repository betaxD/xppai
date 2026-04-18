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

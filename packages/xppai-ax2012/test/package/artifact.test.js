'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const { packDryRun } = require('../../scripts/verify-artifact');
const { PUBLIC_SKILLS } = require('../../src/constants');
const { loadReferenceManifest } = require('../../src/skills/manifest');

const PACKAGE_ROOT = path.resolve(__dirname, '../..');

test('AX 2012 tarball contains only sibling-owned package files', () => {
  const files = packDryRun(PACKAGE_ROOT).map((file) => file.path);
  const manifest = loadReferenceManifest(PACKAGE_ROOT);

  assert(files.includes('package/assets/skills/xppai-ax2012-papai/SKILL.md'));
  assert(files.includes('package/assets/skills/xppai-ax2012-papai/AGENT.md'));
  assert(files.includes('package/src/cli.js'));
  for (const name of PUBLIC_SKILLS) {
    assert(files.includes(`package/assets/skills/${name}/SKILL.md`), `missing packaged skill: ${name}`);
  }
  for (const ref of manifest.references) {
    assert(files.includes(`package/assets/references/${ref.path}`), `missing packaged reference: ${ref.id}`);
  }
  assert(files.every((file) => /^(?:package\/(?:assets|bin|docs|src)\/|package\/(?:package\.json|README\.md)$)/.test(file)));
});

test('installed tarball passes its CLI and target smoke tests', () => {
  const result = spawnSync(process.execPath, ['scripts/verify-artifact.js'], {
    cwd: PACKAGE_ROOT,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /AX 2012 artifact verified/i);
});

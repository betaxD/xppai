'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const { PUBLIC_SKILLS } = require('../../src/constants');
const { loadReferenceManifest } = require('../../src/skills/manifest');

const PACKAGE_ROOT = path.resolve(__dirname, '../..');

function read(relative) {
  return fs.readFileSync(path.join(PACKAGE_ROOT, relative), 'utf8');
}

test('README documents independent install and side-by-side safety', () => {
  const readme = read('README.md');

  assert.match(readme, /npm install -g xppai-ax2012/);
  assert.match(readme, /xppai-ax2012 install --target codex/);
  assert.match(readme, /side-by-side with xppai@1\.0\.24/i);
  assert.match(readme, /AX 2012 R3/);
  assert.match(readme, /does not provide[\s\S]*AX 2009[\s\S]*D365/i);
  for (const target of ['claude', 'codex', 'qwen', 'copilot', 'generic']) assert.match(readme, new RegExp(`\\b${target}\\b`));
});

test('CLI documentation covers every public command, important flag, and exit behavior', () => {
  const cli = read('docs/cli.md');

  for (const command of ['list', 'path', 'install', 'export', 'xpo load', 'xpo load-stdin', 'xpo snapshot', 'xpo list', 'xpo read', 'xpo grep', 'xpo export-modified']) {
    assert.match(cli, new RegExp(`\\b${command.replace(/[ -]/g, '[ -]')}\\b`));
  }
  for (const flag of ['--target', '--out', '--mode', '--cache-dir', '--base', '--head']) assert.match(cli, new RegExp(flag));
  assert.match(cli, /exit code 0/i);
  assert.match(cli, /non-zero/i);
});

test('skills documentation lists all public skills and manifest references', () => {
  const skills = read('docs/skills.md');
  const manifest = loadReferenceManifest(PACKAGE_ROOT);

  for (const name of PUBLIC_SKILLS) assert.match(skills, new RegExp(`\\b${name}\\b`));
  for (const ref of manifest.references) assert.match(skills, new RegExp(ref.id.replace('.', '\\.')));
  assert.equal(PUBLIC_SKILLS.length, 10);
  assert.equal(manifest.references.length, 12);
});

test('cache, target, and release docs preserve their safety contracts', () => {
  const cache = read('docs/xpo-cache.md');
  const targets = read('docs/targets.md');
  const release = read('docs/release.md');

  for (const pattern of [/schemaVersion/, /2012-R3/, /--cache-dir[\s\S]*user config[\s\S]*environment[\s\S]*default/i, /append-only/i, /active revision/i, /explicit base[\s\S]*head/i, /no automatic pruning/i]) assert.match(cache, pattern);
  for (const pattern of [/copy/i, /symlink/i, /rollback/i, /\.xppai-ax2012-owned\.json/, /retire/i, /below `--out`/i]) assert.match(targets, pattern);
  for (const pattern of [/source/i, /tarball/i, /target/i, /side-by-side/i, /technical review/i, /publish/i]) assert.match(release, pattern);
});

test('help skill and command expose the public catalog', () => {
  const help = read('assets/skills/xppai-ax2012-help/SKILL.md');
  const command = read('assets/commands/xppai-ax2012-help.md');

  assert.match(help, /Microsoft Dynamics AX 2012 R3/);
  assert.match(help, /ten public skills/i);
  assert.match(help, /twelve reference packs/i);
  assert.match(command, /xppai-ax2012-help/);
});

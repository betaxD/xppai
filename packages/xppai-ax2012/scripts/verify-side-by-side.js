#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { applyInstallPlan, buildInstallPlan } = require('../src/ownership/transaction');
const { loadTarget } = require('../src/targets');

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const ASSET_ROOT = path.join(PACKAGE_ROOT, 'assets');

function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value, 'utf8');
}

function destinationsFor(target, root) {
  const adapter = loadTarget(target);
  if (target === 'generic') return adapter.resolveExportDestinations(path.join(root, 'export'));
  return adapter.resolveInstallDestinations({ homeDir: path.join(root, 'home'), cwd: path.join(root, 'repository') });
}

function verifyTarget(target, mode, root, initialAssets) {
  const destinations = destinationsFor(target, path.join(root, `${target}-${mode}`));
  const sentinels = [];
  for (const [kind, destination] of Object.entries(destinations)) {
    const legacy = kind === 'skills' ? path.join(destination, 'xppai-core', 'SKILL.md') : path.join(destination, 'xppai-papai.md');
    const user = path.join(destination, 'user-owned-sentinel.txt');
    write(legacy, `legacy-${target}-${kind}`);
    write(user, `user-${target}-${kind}`);
    sentinels.push([legacy, fs.readFileSync(legacy)], [user, fs.readFileSync(user)]);
  }

  applyInstallPlan(buildInstallPlan({ assetRoot: initialAssets, destinations, target, mode, version: '0.0.0' }));
  assert(fs.existsSync(path.join(destinations.skills, 'xppai-ax2012-retired')));
  applyInstallPlan(buildInstallPlan({ assetRoot: ASSET_ROOT, destinations, target, mode, version: '0.1.1' }));
  assert.equal(fs.existsSync(path.join(destinations.skills, 'xppai-ax2012-retired')), false);
  for (const [file, bytes] of sentinels) assert.deepEqual(fs.readFileSync(file), bytes, `${target} changed ${file}`);
}

function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'xppai-side-by-side-'));
  try {
    const initialAssets = path.join(root, 'initial-assets');
    fs.cpSync(ASSET_ROOT, initialAssets, { recursive: true });
    write(path.join(initialAssets, 'skills', 'xppai-ax2012-retired', 'SKILL.md'), 'retired\n');
    for (const target of ['claude', 'codex', 'qwen', 'copilot', 'generic']) {
      for (const mode of ['copy', 'symlink']) verifyTarget(target, mode, root, initialAssets);
    }
    process.stdout.write('AX 2009 and AX 2012 side-by-side targets verified in copy and symlink modes\n');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

if (require.main === module) {
  try { main(); } catch (error) {
    process.stderr.write(`side-by-side verification failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { main, verifyTarget };

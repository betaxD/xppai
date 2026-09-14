'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const exportCommand = require('../../src/commands/export');
const installCommand = require('../../src/commands/install');
const { buildInstallPlan, applyInstallPlan } = require('../../src/ownership/transaction');
const { loadTarget } = require('../../src/targets');
const { useTempDir } = require('../helpers/tmp');

function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value, 'utf8');
}

test('Claude and generic exports keep skills, commands, and manifests below --out', (t) => {
  const root = useTempDir(t, 'xppai-target-export-');
  const assetRoot = path.join(root, 'assets');
  const homeDir = path.join(root, 'home');
  write(path.join(assetRoot, 'skills', 'xppai-ax2012-core', 'SKILL.md'), 'core');
  write(path.join(assetRoot, 'commands', 'xppai-ax2012-papai.md'), 'command');

  for (const target of ['claude', 'generic']) {
    const out = path.join(root, `out-${target}`);
    const destinations = loadTarget(target).resolveExportDestinations(out);
    applyInstallPlan(buildInstallPlan({
      assetRoot,
      destinations,
      target,
      mode: 'copy',
      version: '1.0.0',
    }));
    assert.equal(fs.readFileSync(path.join(out, 'skills', 'xppai-ax2012-core', 'SKILL.md'), 'utf8'), 'core');
    assert.equal(fs.readFileSync(path.join(out, 'commands', 'xppai-ax2012-papai.md'), 'utf8'), 'command');
    assert.equal(fs.existsSync(path.join(out, 'skills', '.xppai-ax2012-owned.json')), true);
  }
  assert.equal(fs.existsSync(homeDir), false);
});

test('Copilot export cannot escape its requested output directory', (t) => {
  const root = useTempDir(t, 'xppai-copilot-export-');
  const assetRoot = path.join(root, 'assets');
  const out = path.join(root, 'out');
  write(path.join(assetRoot, 'skills', 'xppai-ax2012-core', 'SKILL.md'), 'core');
  const destinations = loadTarget('copilot').resolveExportDestinations(out);

  applyInstallPlan(buildInstallPlan({
    assetRoot,
    destinations,
    target: 'copilot',
    mode: 'copy',
    version: '1.0.0',
  }));
  assert.equal(
    fs.readFileSync(path.join(out, '.github', 'skills', 'xppai-ax2012-core', 'SKILL.md'), 'utf8'),
    'core',
  );
  assert.equal(fs.existsSync(path.join(root, '.github')), false);
});

test('install and export commands use adapters while generic remains export-only', (t) => {
  const root = useTempDir(t, 'xppai-commands-');
  const assetRoot = path.join(root, 'assets');
  const homeDir = path.join(root, 'home');
  const out = path.join(root, 'export');
  write(path.join(assetRoot, 'skills', 'xppai-ax2012-core', 'SKILL.md'), 'core');
  write(path.join(assetRoot, 'commands', 'xppai-ax2012-papai.md'), 'command');

  const installed = installCommand(
    { '--target': 'codex', '--mode': 'copy' },
    [],
    { assetRoot, homeDir, quiet: true },
  );
  assert.equal(installed.length, 1);
  assert.equal(
    fs.readFileSync(path.join(homeDir, '.codex', 'skills', 'xppai-ax2012-core', 'SKILL.md'), 'utf8'),
    'core',
  );

  const exported = exportCommand(
    { '--target': 'generic', '--out': out, '--mode': 'copy' },
    [],
    { assetRoot, quiet: true },
  );
  assert.equal(exported.target, 'generic');
  assert.equal(fs.readFileSync(path.join(out, 'commands', 'xppai-ax2012-papai.md'), 'utf8'), 'command');
  assert.throws(
    () => installCommand({ '--target': 'generic' }, [], { assetRoot, homeDir, quiet: true }),
    /export-only/i,
  );
});

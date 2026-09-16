'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const exportCommand = require('../../src/commands/export');
const installCommand = require('../../src/commands/install');
const assets = require('../../src/assets');
const { buildInstallPlan, applyInstallPlan } = require('../../src/ownership/transaction');
const { loadTarget, TARGETS } = require('../../src/targets');
const { useTempDir } = require('../helpers/tmp');

function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value, 'utf8');
}

function writeReferences(assetRoot) {
  write(path.join(assetRoot, 'references', 'manifest.json'), '{"references":[]}');
}

test('Claude and generic exports keep skills, commands, and manifests below --out', (t) => {
  const root = useTempDir(t, 'xppai-target-export-');
  const assetRoot = path.join(root, 'assets');
  const homeDir = path.join(root, 'home');
  write(path.join(assetRoot, 'skills', 'xppai-ax2012-core', 'SKILL.md'), 'core');
  write(path.join(assetRoot, 'commands', 'xppai-ax2012-papai.md'), 'command');
  writeReferences(assetRoot);

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
  writeReferences(assetRoot);
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
  writeReferences(assetRoot);

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

test('real installs and exports own the canonical reference bundle in copy and symlink modes', (t) => {
  const root = useTempDir(t, 'xppai-reference-bundle-');
  const referenceManifest = JSON.parse(fs.readFileSync(
    path.join(assets.root(), 'references', 'manifest.json'),
    'utf8',
  ));
  function assertBundle(skillsRoot, ownership) {
    const bundleRoot = path.join(skillsRoot, 'xppai-ax2012-references');
    assert.equal(fs.existsSync(path.join(bundleRoot, 'manifest.json')), true);
    for (const reference of referenceManifest.references) {
      assert.deepEqual(
        fs.readFileSync(path.join(bundleRoot, reference.path)),
        fs.readFileSync(path.join(assets.root(), 'references', reference.path)),
        reference.id,
      );
    }
    const owned = ownership.entries.find((entry) => (
      entry.destination === 'skills' && entry.path === 'xppai-ax2012-references'
    ));
    assert.ok(owned, 'reference bundle must be protected by the ownership manifest');
    assert.equal(owned.kind, ownership.mode);
    const persisted = JSON.parse(fs.readFileSync(
      path.join(skillsRoot, '.xppai-ax2012-owned.json'),
      'utf8',
    ));
    assert.deepEqual(persisted.entries, ownership.entries);
  }

  for (const mode of ['copy', 'symlink']) {
    for (const target of installCommand.INSTALL_TARGETS) {
      const targetRoot = path.join(root, 'install', mode, target);
      const context = {
        homeDir: path.join(targetRoot, 'home'),
        cwd: path.join(targetRoot, 'cwd'),
        quiet: true,
      };
      const result = installCommand(
        { '--target': target, '--mode': mode },
        [],
        context,
      )[0];
      assertBundle(result.destinations.skills, result.manifest);
      assertBundle(
        result.destinations.skills,
        installCommand({ '--target': target, '--mode': mode }, [], context)[0].manifest,
      );
    }

    for (const target of Object.keys(TARGETS)) {
      const out = path.join(root, 'export', mode, target);
      const result = exportCommand(
        { '--target': target, '--out': out, '--mode': mode },
        [],
        { quiet: true },
      );
      assertBundle(result.destinations.skills, result.manifest);
      assertBundle(
        result.destinations.skills,
        exportCommand({ '--target': target, '--out': out, '--mode': mode }, [], { quiet: true }).manifest,
      );
    }
  }
});

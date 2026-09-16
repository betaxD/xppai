'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { buildInstallPlan, applyInstallPlan } = require('../../src/ownership/transaction');
const { useTempDir } = require('../helpers/tmp');

function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value, 'utf8');
}

function release(root, name, entries) {
  const assetRoot = path.join(root, name, 'assets');
  write(path.join(assetRoot, 'references', 'manifest.json'), `references ${name}`);
  for (const [relative, content] of Object.entries(entries)) {
    write(path.join(assetRoot, relative), content);
  }
  return assetRoot;
}

test('upgrade retires only recorded AX 2012 entries in copy and symlink modes', (t) => {
  const root = useTempDir(t, 'xppai-upgrade-');
  const v1 = release(root, 'v1', {
    'skills/xppai-ax2012-current/SKILL.md': 'current v1',
    'skills/xppai-ax2012-retired/SKILL.md': 'retired v1',
  });
  const v2 = release(root, 'v2', {
    'skills/xppai-ax2012-current/SKILL.md': 'current v2',
  });

  for (const mode of ['copy', 'symlink']) {
    const skills = path.join(root, `target-${mode}`, 'skills');
    const ax2009 = path.join(skills, 'xppai-core', 'SKILL.md');
    const user = path.join(skills, 'xppai-ax2012-user-made', 'SKILL.md');
    write(ax2009, 'AX 2009 sentinel');
    write(user, 'user sentinel');

    applyInstallPlan(buildInstallPlan({
      assetRoot: v1,
      destinations: { skills },
      target: 'codex',
      mode,
      version: '1.0.0',
    }));
    const v2Plan = buildInstallPlan({
      assetRoot: v2,
      destinations: { skills },
      target: 'codex',
      mode,
      version: '2.0.0',
    });
    applyInstallPlan(v2Plan);
    applyInstallPlan(v2Plan);

    assert.equal(fs.readFileSync(ax2009, 'utf8'), 'AX 2009 sentinel');
    assert.equal(fs.readFileSync(user, 'utf8'), 'user sentinel');
    assert.equal(fs.existsSync(path.join(skills, 'xppai-ax2012-retired')), false);
    assert.equal(
      fs.readFileSync(path.join(skills, 'xppai-ax2012-current', 'SKILL.md'), 'utf8'),
      'current v2',
    );
  }
});

test('an unowned collision is rejected without treating the namespace prefix as authorization', (t) => {
  const root = useTempDir(t, 'xppai-collision-');
  const assetRoot = release(root, 'release', {
    'skills/xppai-ax2012-user-made/SKILL.md': 'release content',
  });
  const skills = path.join(root, 'target', 'skills');
  const sentinel = path.join(skills, 'xppai-ax2012-user-made', 'SKILL.md');
  write(sentinel, 'user content');

  assert.throws(() => applyInstallPlan(buildInstallPlan({
    assetRoot,
    destinations: { skills },
    target: 'codex',
    mode: 'copy',
    version: '1.0.0',
  })), /unowned destination collision/i);
  assert.equal(fs.readFileSync(sentinel, 'utf8'), 'user content');
});

test('upgrade refuses to overwrite an owned entry changed after the previous install', (t) => {
  const root = useTempDir(t, 'xppai-owned-change-');
  const v1 = release(root, 'v1', {
    'skills/xppai-ax2012-core/SKILL.md': 'release v1',
  });
  const v2 = release(root, 'v2', {
    'skills/xppai-ax2012-core/SKILL.md': 'release v2',
  });
  const skills = path.join(root, 'target', 'skills');
  const installed = path.join(skills, 'xppai-ax2012-core', 'SKILL.md');
  applyInstallPlan(buildInstallPlan({
    assetRoot: v1,
    destinations: { skills },
    target: 'codex',
    mode: 'copy',
    version: '1.0.0',
  }));
  write(installed, 'user modification');

  assert.throws(() => applyInstallPlan(buildInstallPlan({
    assetRoot: v2,
    destinations: { skills },
    target: 'codex',
    mode: 'copy',
    version: '2.0.0',
  })), /changed since the previous manifest/i);
  assert.equal(fs.readFileSync(installed, 'utf8'), 'user modification');
});

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { runCli } = require('../helpers/cli');
const { mkdtemp } = require('../helpers/tmp');

function assertPathEntryMissing(entryPath, message) {
  assert.throws(
    () => fs.lstatSync(entryPath),
    (error) => error && error.code === 'ENOENT',
    message,
  );
}

test('generic export retires the former AX 2009 Ririchard skill in copy and symlink modes', () => {
  const adapter = require('../../src/targets/generic');
  const assets = require('../../src/assets');

  for (const mode of ['copy', 'symlink']) {
    const root = mkdtemp(`xppai-retire-${mode}-`);
    const output = path.join(root, 'skills');
    const legacy = path.join(output, 'xppai-ririchard');
    fs.mkdirSync(output, { recursive: true });

    if (mode === 'symlink') {
      const target = path.join(root, 'removed-legacy-skill');
      fs.mkdirSync(target);
      fs.symlinkSync(target, legacy, process.platform === 'win32' ? 'junction' : 'dir');
      fs.rmSync(target, { recursive: true, force: true });
    } else {
      fs.mkdirSync(legacy);
      fs.writeFileSync(path.join(legacy, 'SKILL.md'), 'legacy AX 2009 skill', 'utf8');
    }

    try {
      adapter.export(assets.path(), output, { mode });
      assertPathEntryMissing(legacy, `${mode} export must retire xppai-ririchard`);
      assert.equal(fs.existsSync(path.join(output, 'xppai-papai', 'SKILL.md')), true);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  }
});

test('Claude install retires dangling links for the former skill and command', () => {
  const home = mkdtemp('xppai-retire-claude-');
  const legacySkill = path.join(home, '.claude', 'skills', 'xppai-ririchard');
  const legacyCommand = path.join(home, '.claude', 'commands', 'xppai-ririchard.md');
  const removedSkillTarget = path.join(home, 'removed-skill-target');
  const removedCommandTarget = path.join(home, 'removed-command-target');
  fs.mkdirSync(path.dirname(legacySkill), { recursive: true });
  fs.mkdirSync(path.dirname(legacyCommand), { recursive: true });
  fs.mkdirSync(removedSkillTarget);
  fs.writeFileSync(removedCommandTarget, 'legacy command target', 'utf8');
  const linkType = process.platform === 'win32' ? 'junction' : 'dir';
  fs.symlinkSync(removedSkillTarget, legacySkill, linkType);
  fs.symlinkSync(removedCommandTarget, legacyCommand, 'file');
  fs.rmSync(removedSkillTarget, { recursive: true, force: true });
  fs.rmSync(removedCommandTarget, { force: true });

  try {
    const output = runCli(['install', '--target', 'claude'], {
      env: { ...process.env, HOME: home, USERPROFILE: home },
    });

    assert.match(output, /installed claude to /);
    assertPathEntryMissing(legacySkill, 'Claude must retire the old skill link');
    assertPathEntryMissing(legacyCommand, 'Claude must retire the old command link');
    assert.equal(fs.existsSync(path.join(home, '.claude', 'skills', 'xppai-papai', 'SKILL.md')), true);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
  }
});

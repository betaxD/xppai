'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');

test('the AX 2009 package does not expose Ririchard assets or routing', () => {
  const forbiddenPaths = [
    'assets/skills/xppai-ririchard/SKILL.md',
    'assets/commands/xppai-ririchard.md',
  ];

  for (const relative of forbiddenPaths) {
    assert.equal(fs.existsSync(path.join(ROOT, relative)), false, `${relative} must belong only to AX 2012`);
  }

  const searchableFiles = [
    'README.md',
    'docs/skills.md',
    'assets/skills/xppai-help/SKILL.md',
    'assets/skills/xppai-papai/SKILL.md',
    'assets/agents/xppai-papai/AGENT.md',
  ];

  for (const relative of searchableFiles) {
    const content = fs.readFileSync(path.join(ROOT, relative), 'utf8');
    assert.doesNotMatch(content, /ririchard|review_frigelar_compliance/i, `${relative} must not route AX 2012 policy`);
  }
});

test('the AX 2009 package advances to a cleanup release', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const lock = JSON.parse(fs.readFileSync(path.join(ROOT, 'package-lock.json'), 'utf8'));

  assert.equal(pkg.version, '1.0.24');
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[''].version, pkg.version);
});

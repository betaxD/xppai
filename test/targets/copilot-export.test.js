'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { mkdtemp } = require('../helpers/tmp');

test('copilot adapter exports Copilot CLI skill directories', () => {
  const adapter = require('../../src/targets/copilot');
  const assets = require('../../src/assets');
  const tempDir = mkdtemp('xppai-copilot-');

  try {
    adapter.export(assets.path(), tempDir);

    const papaiDir = path.join(tempDir, 'xppai-papai');
    assert.ok(fs.statSync(papaiDir).isDirectory(), 'xppai-papai skill directory must be exported');

    const papaiSkill = path.join(papaiDir, 'SKILL.md');
    assert.ok(fs.existsSync(papaiSkill), 'SKILL.md must be preserved for Copilot skills');

    const papaiContent = fs.readFileSync(papaiSkill, 'utf8');
    assert.match(papaiContent, /^---\r?\nname:\s*xppai-papai/m);
    assert.match(papaiContent, /Dynamic Senior Analysis/i);
    assert.match(papaiContent, /assets\/agents\/xppai-papai\/AGENT\.md/i);

    assert.ok(!fs.existsSync(path.join(tempDir, 'copilot-instructions.md')));
    assert.ok(!fs.existsSync(path.join(tempDir, 'instructions')));
    assert.ok(!fs.existsSync(path.join(tempDir, 'prompts')));

    const owned = adapter.listOwnedEntries(assets.path());
    const actual = fs.readdirSync(tempDir).sort();
    assert.deepEqual(actual, owned.sort(), 'exported Copilot skills must match owned entries');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

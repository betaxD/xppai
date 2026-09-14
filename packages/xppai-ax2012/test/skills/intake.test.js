'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const PACKAGE_ROOT = path.resolve(__dirname, '../..');
const SKILLS_ROOT = path.join(PACKAGE_ROOT, 'assets', 'skills');

function readSkill(name) {
  return fs.readFileSync(path.join(SKILLS_ROOT, name, 'SKILL.md'), 'utf8');
}

test('core fixes the product baseline, evidence labels, and reference loading boundary', () => {
  const core = readSkill('xppai-ax2012-core');

  assert.match(core, /Microsoft Dynamics AX 2012 R3/);
  assert.match(core, /xppai-ax2012/);
  assert.match(core, /Confirmed[\s\S]*Likely[\s\S]*Hypothesis[\s\S]*Unknown/);
  assert.match(core, /manifest\.json/);
  assert.match(core, /not loaded by default/i);
  assert.match(core, /Never use AX 2009 or D365 implementation rules as substitutes/i);
});

test('intake accepts each evidence form and parses XPO at most once', () => {
  const intake = readSkill('xppai-ax2012-intake');

  for (const evidence of [
    'local XPO file',
    'pasted XPO',
    'cache revision',
    'stack trace',
    'requirements',
    'diff',
    'plain-language description',
  ]) {
    assert.match(intake, new RegExp(evidence, 'i'));
  }
  assert.match(intake, /at most one XPO parse per request/i);
  assert.match(intake, /encoding[\s\S]*BOM[\s\S]*original-byte hash/i);
  assert.match(intake, /complete[\s\S]*incomplete[\s\S]*indeterminate/i);
});

test('AX 2012 assets contain no unversioned AX 2009 skill dependency or mirror tree', () => {
  const assetText = [
    readSkill('xppai-ax2012-core'),
    readSkill('xppai-ax2012-intake'),
    readSkill('xppai-ax2012-papai'),
  ].join('\n');

  assert.doesNotMatch(assetText, /\bxppai-(?:core|domain|posting|support)\b/);
  for (const mirror of ['skills', 'commands', 'agents']) {
    assert.equal(fs.existsSync(path.join(PACKAGE_ROOT, mirror)), false);
  }
});

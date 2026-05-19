'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const SKILLS = path.join(ROOT, 'assets', 'skills');

function readSkill(name) {
  return fs.readFileSync(path.join(SKILLS, name, 'SKILL.md'), 'utf8');
}

const SPECIALISTS = [
  'xppai-codefix',
  'xppai-explain',
  'xppai-risk',
  'xppai-stack',
];

test('xppai-init defines shared XPO intake state contract', () => {
  const content = readSkill('xppai-init');

  assert.match(content, /compatibility/i);
  assert.match(content, /xppai-core/i);
  assert.match(content, /xppai-domain/i);
  assert.match(content, /xppai-intake/i);
  assert.match(content, /only when XPO input is present/i);
});

test('xppai-papai runs XPO intake once before orchestration', () => {
  const content = readSkill('xppai-papai');

  assert.match(content, /\*\*XPO input:\*\*\s*run [`']?xppai-intake[`']? once/i);
  assert.match(content, /Choose the minimum useful sequence/i);
  assert.match(content, /direct local file or pasted text evidence first/i);
  assert.match(content, /Path used:\s*direct-file/i);
  assert.match(content, /Fallback reason:\s*<file access failure\|missing detail>/i);
});

test('xppai-babysit runs XPO intake once before classification', () => {
  const content = readSkill('xppai-babysit');

  assert.match(content, /\*\*XPO input:\*\*\s*run [`']?xppai-intake[`']? once/i);
  assert.match(content, /## Classification/i);
  assert.match(content, /xppai-stack -> xppai-codefix/i);
  assert.match(content, /## Required Headers/i);
});

for (const skill of SPECIALISTS) {
  test(`${skill} enforces direct-file path with controlled fallback`, () => {
    const content = readSkill(skill);

    assert.match(content, /xppai-intake/i);
    assert.match(content, /\*\*XPO input:\*\*\s*run [`']?xppai-intake[`']? once/i);
    assert.doesNotMatch(content, /xppai xpo snapshot --json/i);
  });
}

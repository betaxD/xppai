'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const { validateSkillContracts } = require('../../src/skills/contracts');

const PACKAGE_ROOT = path.resolve(__dirname, '../..');
const ASSET_ROOT = path.join(PACKAGE_ROOT, 'assets');
const SPECIALISTS = ['explain', 'architect', 'risk', 'codefix', 'dev'];

function readSkill(name) {
  return fs.readFileSync(path.join(ASSET_ROOT, 'skills', name, 'SKILL.md'), 'utf8');
}

function readCommand(name) {
  return fs.readFileSync(path.join(ASSET_ROOT, 'commands', `${name}.md`), 'utf8');
}

test('specialists are direct, distinct, and baseline scoped', () => {
  for (const name of SPECIALISTS) {
    const skill = readSkill(`xppai-ax2012-${name}`);
    assert.match(skill, /Microsoft Dynamics AX 2012 R3/);
    assert.doesNotMatch(skill, /AX 2009|Chain of Command|D365 extension/);
    assert.match(skill, /Do not silently chain/i);
    assert.match(skill, /xppai-ax2012-core/);
    assert.match(skill, /xppai-ax2012-intake/);
    assert.match(skill, /manifest\.json/);
    assert.match(skill, /production-ready[\s\S]*evidence/i);
  }
});

test('codefix restores existing behavior while dev creates or expands behavior', () => {
  const codefix = readSkill('xppai-ax2012-codefix');
  const dev = readSkill('xppai-ax2012-dev');

  assert.match(codefix, /existing[\s\S]*(?:defective|regressed|slow|incorrect)/i);
  assert.match(codefix, /smallest safe change/i);
  assert.match(codefix, /does not invent (?:a )?root cause/i);
  assert.match(dev, /does not yet exist|expand[s]? an existing contract/i);
  assert.match(dev, /Tag ID[\s\S]*Project ID[\s\S]*Dev Name[\s\S]*date/i);
  assert.match(dev, /AOT object inventory/i);
  assert.match(dev, /compile[\s\S]*database synchronization[\s\S]*CIL/i);
});

test('specialists expose intent-specific evidence and output contracts', () => {
  const explain = readSkill('xppai-ax2012-explain');
  const architect = readSkill('xppai-ax2012-architect');
  const risk = readSkill('xppai-ax2012-risk');

  assert.match(explain, /byte[\s\S]*line references/i);
  assert.match(explain, /model[\s\S]*layer[\s\S]*subscriber/i);
  for (const pattern of [/model-store impact/i, /service boundaries/i, /batch\/CIL/i, /security/i, /deployment/i]) {
    assert.match(architect, pattern);
  }
  for (const pattern of [/evidence quality/i, /model\/layer/i, /posting/i, /AIF/i, /data integrity/i, /regional/i, /risk score/i]) {
    assert.match(risk, pattern);
  }
});

test('command wrappers launch the matching specialist or Papai with bounded inputs', () => {
  for (const name of [...SPECIALISTS, 'papai']) {
    const commandName = `xppai-ax2012-${name}`;
    const command = readCommand(commandName);
    assert.match(command, new RegExp(`\\b${commandName}\\b`));
    assert.match(command, /Expected inputs/i);
    assert.match(command, /baseline conflict/i);
    assert.match(command, /Microsoft Dynamics AX 2012 R3/);
  }
});

test('all implemented public skills satisfy the canonical tree contract', () => {
  const names = validateSkillContracts(PACKAGE_ROOT);

  assert(names.length >= 8);
  for (const name of SPECIALISTS) assert(names.includes(`xppai-ax2012-${name}`));
});

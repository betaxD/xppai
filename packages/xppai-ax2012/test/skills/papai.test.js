'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const { validateSkillContracts } = require('../../src/skills/contracts');

const PACKAGE_ROOT = path.resolve(__dirname, '../..');
const SKILLS_ROOT = path.join(PACKAGE_ROOT, 'assets', 'skills');

function readSkill(name, file = 'SKILL.md') {
  return fs.readFileSync(path.join(SKILLS_ROOT, name, file), 'utf8');
}

test('Papai exposes every accepted action and stops after three cycles', () => {
  const papai = readSkill('xppai-ax2012-papai');

  assert.match(papai, /maxInvestigationCycles:\s*3/);
  for (const action of ['explain', 'architect', 'risk', 'codefix', 'dev']) {
    assert.match(papai, new RegExp(`\\b${action}\\b`));
  }
  assert.match(papai, /return Unknown and the next required evidence/i);
});

test('Papai maps accepted actions directly and gates production-ready guidance', () => {
  const papai = readSkill('xppai-ax2012-papai');

  for (const action of ['explain', 'architect', 'risk', 'codefix', 'dev']) {
    assert.match(papai, new RegExp(`${action}:\\s*xppai-ax2012-${action}`));
  }
  assert.match(papai, /one focused question/i);
  assert.match(papai, /gated[\s\S]*evidence requirements/i);
  assert.match(papai, /deferred[\s\S]*gap report/i);
  assert.match(papai, /intake[\s\S]*at most once per request/i);
});

test('the colocated Papai agent mirrors the routing and stopping contract', () => {
  const agent = readSkill('xppai-ax2012-papai', 'AGENT.md');

  assert.match(agent, /acceptedActions:\s*explain, architect, risk, codefix, dev/);
  assert.match(agent, /maxInvestigationCycles:\s*3/);
  assert.match(agent, /return Unknown and the next required evidence/i);
});

test('foundational skill contracts validate as one canonical AX 2012 tree', () => {
  const foundational = validateSkillContracts(PACKAGE_ROOT).filter((name) => [
    'xppai-ax2012-core',
    'xppai-ax2012-intake',
    'xppai-ax2012-papai',
  ].includes(name));

  assert.deepEqual(foundational, [
    'xppai-ax2012-core',
    'xppai-ax2012-intake',
    'xppai-ax2012-papai',
  ]);
});

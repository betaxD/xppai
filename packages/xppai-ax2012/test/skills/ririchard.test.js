'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const PACKAGE_ROOT = path.resolve(__dirname, '../..');
const SKILL_NAME = 'xppai-ax2012-ririchard';
const SKILL_PATH = path.join(PACKAGE_ROOT, 'assets', 'skills', SKILL_NAME, 'SKILL.md');
const COMMAND_PATH = path.join(PACKAGE_ROOT, 'assets', 'commands', `${SKILL_NAME}.md`);

function read(relative) {
  return fs.readFileSync(path.join(PACKAGE_ROOT, relative), 'utf8');
}

function readSkill() {
  return fs.readFileSync(SKILL_PATH, 'utf8');
}

test('Ririchard is a discoverable AX 2012 R3 XPO compliance skill', () => {
  assert.equal(fs.existsSync(SKILL_PATH), true);
  const content = readSkill();

  assert.match(content, /^---[\s\S]*name:\s*xppai-ax2012-ririchard\s*$/m);
  assert.match(content, /^description:\s*Use when /m);
  assert.match(content, /Microsoft Dynamics AX 2012 R3/);
  assert.match(content, /xppai-ax2012-intake/);
  assert.doesNotMatch(content, /AX 2009|\bxppai-intake\b/);
});

test('Ririchard exposes exactly the approved Frigelar rule catalog', () => {
  const content = readSkill();
  const actualRuleIds = [...content.matchAll(/^- `([A-Z]+-\d+)`:/gm)]
    .map((match) => match[1])
    .sort();
  const expectedRuleIds = [
    'AIF-1', 'AIF-2', 'AIF-3', 'AIF-4', 'CMP-1', 'DB-1', 'DB-2',
    'NAM-1', 'REV-1', 'TAG-1', 'TAG-2', 'TAG-3', 'TXT-1',
  ].sort();

  assert.deepEqual(actualRuleIds, expectedRuleIds);
  assert.match(content, /only these rules|outside this catalog/i);
  assert.match(content, /do not infer.*AI|do not claim.*AI/i);
});

test('TagFGL rules require the exact Frigelar marker pair and matching attributes', () => {
  const content = readSkill();

  assert.match(content, /\/\/<FGL workitem="NomeDoProjetoAX" date="dd\/mm\/aaaa" user="t_robertaoliveira">/);
  assert.match(content, /\/\/<\/FGL workitem="NomeDoProjetoAX" date="dd\/mm\/aaaa" user="t_robertaoliveira">/);
  assert.match(content, /opening and closing markers[\s\S]*same `workitem`, `date`, and `user`/i);
  assert.match(content, /date[\s\S]*`dd\/mm\/aaaa`/i);
  assert.match(content, /new class[\s\S]*only[\s\S]*`classDeclaration`/i);
  assert.match(content, /new table[\s\S]*every created method/i);
  assert.match(content, /existing object[\s\S]*exactly the changed lines/i);
});

test('Ririchard preserves evidence-aware verdicts and closed review scope', () => {
  const content = readSkill();

  assert.match(content, /PASS\s*\|\s*FAIL\s*\|\s*NOT ASSESSED/);
  assert.match(content, /EntryPoint.*NOT ASSESSED/is);
  assert.match(content, /object.*method.*evidence/is);
  assert.match(content, /not a general[\s\S]*(architecture|correctness|security|performance)/i);
});

test('Ririchard has a public command, catalog entries, and explicit Papai routing', () => {
  assert.equal(fs.existsSync(COMMAND_PATH), true);
  assert.match(fs.readFileSync(COMMAND_PATH, 'utf8'), /xppai-ax2012-ririchard/);

  for (const relative of [
    'README.md',
    'docs/skills.md',
    'assets/skills/xppai-ax2012-help/SKILL.md',
  ]) {
    assert.match(read(relative), /xppai-ax2012-ririchard/i, `${relative} must list Ririchard`);
  }

  for (const relative of [
    'assets/skills/xppai-ax2012-papai/SKILL.md',
    'assets/skills/xppai-ax2012-papai/AGENT.md',
  ]) {
    const content = read(relative);
    assert.match(content, /review_frigelar_compliance.*xppai-ax2012-ririchard/is);
    assert.match(content, /explicit.*Ririchard|Ririchard.*explicit/i);
    assert.match(content, /closed rule catalog/i);
  }
});

test('the AX 2012 package version advances consistently', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));

  assert.equal(pkg.version, '0.1.1');
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[''].version, pkg.version);
});

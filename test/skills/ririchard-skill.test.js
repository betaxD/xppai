'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const SKILL_PATH = path.join(ROOT, 'assets', 'skills', 'xppai-ririchard', 'SKILL.md');
const COMMAND_PATH = path.join(ROOT, 'assets', 'commands', 'xppai-ririchard.md');
const PAPAI_AGENT_PATH = path.join(ROOT, 'assets', 'agents', 'xppai-papai', 'AGENT.md');
const PAPAI_SKILL_PATH = path.join(ROOT, 'assets', 'skills', 'xppai-papai', 'SKILL.md');

function readSkill() {
  return fs.readFileSync(SKILL_PATH, 'utf8');
}

test('xppai-ririchard is a discoverable XPO review skill', () => {
  assert.equal(
    fs.existsSync(SKILL_PATH),
    true,
    'assets/skills/xppai-ririchard/SKILL.md must exist'
  );

  const content = readSkill();
  assert.match(content, /^---[\s\S]*name:\s*xppai-ririchard\s*$/m);
  assert.match(content, /^description:\s*Use when /m);
  assert.match(content, /xppai-intake/i);
});

test('xppai-ririchard exposes exactly the approved Frigelar rule catalog', () => {
  const content = readSkill();
  const actualRuleIds = [...content.matchAll(/^- `([A-Z]+-\d+)`:/gm)]
    .map(match => match[1])
    .sort();

  const expectedRuleIds = [
    'AIF-1',
    'AIF-2',
    'AIF-3',
    'AIF-4',
    'CMP-1',
    'DB-1',
    'DB-2',
    'NAM-1',
    'REV-1',
    'TAG-1',
    'TAG-2',
    'TAG-3',
    'TXT-1',
  ].sort();

  assert.deepEqual(actualRuleIds, expectedRuleIds);
  assert.match(content, /FGL.*optional|optional.*FGL/i);
  assert.match(content, /do not infer.*AI|do not claim.*AI/i);
  assert.match(content, /only these rules|outside this catalog/i);
});

test('xppai-ririchard defines evidence-aware verdicts and missing-input behavior', () => {
  const content = readSkill();

  assert.match(content, /PASS\s*\|\s*FAIL\s*\|\s*NOT ASSESSED/);
  assert.match(content, /EntryPoint.*NOT ASSESSED/is);
  assert.match(content, /TagFGL.*NOT ASSESSED/is);
  assert.match(content, /object.*method.*evidence/is);
});

test('xppai-ririchard is documented in user-facing skill catalogs', () => {
  const catalogs = [
    path.join(ROOT, 'README.md'),
    path.join(ROOT, 'docs', 'skills.md'),
    path.join(ROOT, 'assets', 'skills', 'xppai-help', 'SKILL.md'),
  ];

  for (const catalog of catalogs) {
    const content = fs.readFileSync(catalog, 'utf8');
    assert.match(content, /xppai-ririchard/i, `${catalog} must list xppai-ririchard`);
  }
});

test('xppai-ririchard has a public command wrapper', () => {
  assert.equal(fs.existsSync(COMMAND_PATH), true, 'assets/commands/xppai-ririchard.md must exist');
  const content = fs.readFileSync(COMMAND_PATH, 'utf8');
  assert.match(content, /^---[\s\S]*description:/m);
  assert.match(content, /Use the `xppai-ririchard` skill/i);
});

test('Papai routes explicit Ririchard or Frigelar compliance requests to the skill', () => {
  for (const file of [PAPAI_AGENT_PATH, PAPAI_SKILL_PATH]) {
    const content = fs.readFileSync(file, 'utf8');
    assert.match(content, /review_frigelar_compliance/);
    assert.match(content, /review_frigelar_compliance.*xppai-ririchard/is);
    assert.match(content, /explicit.*Ririchard|Ririchard.*explicit/i);
    assert.match(content, /explicit.*Frigelar|Frigelar.*explicit/i);
  }
});

test('package metadata is advanced to 1.0.23 consistently', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const lock = JSON.parse(fs.readFileSync(path.join(ROOT, 'package-lock.json'), 'utf8'));

  assert.equal(pkg.version, '1.0.23');
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[''].version, pkg.version);
});

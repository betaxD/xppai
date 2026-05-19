'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const nodePath = require('path');

const ROOT = nodePath.join(__dirname, '..', '..');
const AGENT_PATH = nodePath.join(ROOT, 'assets', 'agents', 'xppai-papai', 'AGENT.md');
const SKILL_PATH = nodePath.join(ROOT, 'assets', 'skills', 'xppai-papai', 'SKILL.md');

test('canonical AGENT.md exists', () => {
  assert.equal(fs.existsSync(AGENT_PATH), true, 'assets/agents/xppai-papai/AGENT.md must exist');
});

test('AGENT.md contains required sections', () => {
  const content = fs.readFileSync(AGENT_PATH, 'utf8');
  assert.match(content, /## Mission/);
  assert.match(content, /## Operating Loop/);
  assert.match(content, /## Available Actions/);
  assert.match(content, /## Validation Rules/);
  assert.match(content, /## Stop Conditions/);
});

test('AGENT.md includes AX 2009 scope and loop safety rule', () => {
  const content = fs.readFileSync(AGENT_PATH, 'utf8');
  assert.match(content, /AX 2009/);
  assert.match(content, /Do not exceed 3 investigation cycles unless explicitly requested/);
});

test('AGENT.md enforces direct-file and constrained fallback policy', () => {
  const content = fs.readFileSync(AGENT_PATH, 'utf8');
  assert.match(content, /inspect the local `.xpo` file directly/i);
  assert.match(content, /fallback/i);
  assert.match(content, /insufficient detail/i);
  assert.match(content, /Path used:\s*direct-file/i);
  assert.match(content, /Fallback reason:\s*<file access failure\|missing detail>/i);
});

test('AGENT.md references required skills', () => {
  const content = fs.readFileSync(AGENT_PATH, 'utf8');
  const requiredSkills = [
    'xppai-init',
    'xppai-explain',
    'xppai-stack',
    'xppai-risk',
    'xppai-codefix',
    'xppai-posting',
    'xppai-architect',
    'xppai-exportxpo',
  ];

  for (const skill of requiredSkills) {
    assert.match(content, new RegExp(skill), `AGENT.md must mention ${skill}`);
  }
});

test('AGENT.md includes support triage action mapping', () => {
  const content = fs.readFileSync(AGENT_PATH, 'utf8');
  assert.match(content, /triage_support_issue/);
  assert.match(content, /xppai-support/);
  assert.match(content, /business support symptom/i);
});

test('legacy SKILL.md keeps frontmatter name', () => {
  const content = fs.readFileSync(SKILL_PATH, 'utf8');
  assert.match(content, /name:\s*xppai-papai/);
});

test('legacy SKILL.md references canonical AGENT.md and cycle limit', () => {
  const content = fs.readFileSync(SKILL_PATH, 'utf8');
  assert.match(content, /assets\/agents\/xppai-papai\/AGENT\.md/);
  assert.match(content, /(Maximum|Do not exceed)\s+3 investigation cycles/i);
});

test('legacy SKILL.md includes support-triage compatibility guidance', () => {
  const content = fs.readFileSync(SKILL_PATH, 'utf8');
  assert.match(content, /xppai-support/);
  assert.match(content, /business[\/\s-]*support symptom/i);
});

test('legacy SKILL.md references direct-file intake and avoids cache-first snapshot path', () => {
  const content = fs.readFileSync(SKILL_PATH, 'utf8');
  assert.match(content, /direct local file|direct local-file|direct-file|local `.xpo` file directly/i);
  assert.doesNotMatch(content, /xppai xpo snapshot --json/i);
});

test('legacy SKILL.md documents action routing guidance', () => {
  const content = fs.readFileSync(SKILL_PATH, 'utf8');
  assert.match(content, /## Available Actions/i);
  assert.match(content, /xppai-support/i);
});

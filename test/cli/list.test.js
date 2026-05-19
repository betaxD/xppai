'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { runCli } = require('../helpers/cli');

const ROOT = path.join(__dirname, '..', '..');
const SKILLS_DIR = path.join(ROOT, 'assets', 'skills');

function expectedSkillsFromDisk() {
  return fs.readdirSync(SKILLS_DIR)
    .filter(name => fs.statSync(path.join(SKILLS_DIR, name)).isDirectory())
    .sort();
}

test('cli: xppai list exits 0 and prints all skill names', () => {
  const out = runCli(['list']);
  const lines = out.trim().split('\n').sort();
  assert.deepEqual(lines, expectedSkillsFromDisk());
});

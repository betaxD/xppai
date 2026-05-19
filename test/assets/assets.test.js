'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const SKILLS_DIR = path.join(ROOT, 'assets', 'skills');

function expectedSkillsFromDisk() {
  return fs.readdirSync(SKILLS_DIR)
    .filter(name => fs.statSync(path.join(SKILLS_DIR, name)).isDirectory())
    .sort();
}

test('assets.list() returns all skill directories in sorted order', () => {
  const assets = require('../../src/assets');
  assert.deepEqual(assets.list(), expectedSkillsFromDisk());
});

test('assets.path() returns a directory that exists on disk', () => {
  const assets = require('../../src/assets');
  const p = assets.path();
  assert.ok(typeof p === 'string' && p.length > 0);
  assert.ok(fs.existsSync(p), `assets.path() does not exist: ${p}`);
});

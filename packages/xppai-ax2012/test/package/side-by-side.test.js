'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const PACKAGE_ROOT = path.resolve(__dirname, '../..');

test('AX 2009 and AX 2012 target installs preserve each other', () => {
  const result = spawnSync(process.execPath, ['scripts/verify-side-by-side.js'], {
    cwd: PACKAGE_ROOT,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /side-by-side targets verified/i);
});

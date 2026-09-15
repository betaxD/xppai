'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const PACKAGE_ROOT = path.resolve(__dirname, '../..');

test('publication scripts are sibling-local and preserve the root package', () => {
  const rootPkg = require('../../../../package.json');
  const pkg = require('../../package.json');
  assert.equal(rootPkg.name, 'xppai');
  assert.equal(pkg.name, 'xppai-ax2012');
  assert.equal(
    pkg.scripts.prepublishOnly,
    'npm test && npm run verify:artifact && npm run verify:side-by-side && npm run verify:technical-review && npm run verify:ax2009',
  );
  assert.notEqual(pkg.private, true);
  assert.equal(Object.hasOwn(rootPkg.scripts, 'verify:ax2012'), false);
});

test('publication checklist documents the independent release gate', () => {
  const checklist = fs.readFileSync(path.join(PACKAGE_ROOT, 'docs', 'publishing-checklist.md'), 'utf8');

  for (const requirement of [
    /human AX 2012 technical approval/i,
    /clean root AX 2009 baseline/i,
    /clean sibling test run/i,
    /artifact install smoke tests/i,
    /side-by-side target tests/i,
    /npm pack/i,
    /version bump in the sibling only/i,
    /npm publish/i,
    /packages\/xppai-ax2012\//,
  ]) {
    assert.match(checklist, requirement);
  }
});

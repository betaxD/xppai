'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const PACKAGE_ROOT = path.resolve(__dirname, '../..');

function walkFiles(root) {
  if (!fs.existsSync(root)) return [];

  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(root, entry.name);
    return entry.isDirectory() ? walkFiles(absolute) : [absolute];
  });
}

test('AX 2012 is an independent sibling package', () => {
  const pkg = require(path.join(PACKAGE_ROOT, 'package.json'));

  assert.equal(pkg.name, 'xppai-ax2012');
  assert.equal(pkg.version, '0.1.1');
  assert.equal(pkg.type, 'commonjs');
  assert.equal(pkg.bin['xppai-ax2012'], 'bin/xppai-ax2012.js');
  assert.deepEqual(pkg.files, ['assets/', 'bin/', 'docs/', 'src/']);
  assert.equal(pkg.engines.node, '>=18');
  assert.equal(pkg.workspaces, undefined);

  for (const file of walkFiles(path.join(PACKAGE_ROOT, 'src'))) {
    assert.doesNotMatch(
      fs.readFileSync(file, 'utf8'),
      /require\(['"](?:\.\.\/){3,}/,
      `${path.relative(PACKAGE_ROOT, file)} imports outside the AX 2012 package`,
    );
  }
});

test('AX 2012 exports only its versioned product identity and skill namespace', () => {
  const { CACHE_IDENTITY, PRODUCT_IDENTITY, PUBLIC_SKILLS } = require('../../src/constants');

  assert.deepEqual(PRODUCT_IDENTITY, {
    package: 'xppai-ax2012',
    cli: 'xppai-ax2012',
    product: 'Microsoft Dynamics AX',
    baseline: '2012-R3',
  });
  assert.deepEqual(CACHE_IDENTITY, {
    schemaVersion: 1,
    package: 'xppai-ax2012',
    cli: 'xppai-ax2012',
    product: 'Microsoft Dynamics AX',
    baseline: '2012-R3',
  });
  assert.deepEqual(PUBLIC_SKILLS, [
    'xppai-ax2012-core',
    'xppai-ax2012-intake',
    'xppai-ax2012-papai',
    'xppai-ax2012-explain',
    'xppai-ax2012-architect',
    'xppai-ax2012-risk',
    'xppai-ax2012-codefix',
    'xppai-ax2012-dev',
    'xppai-ax2012-ririchard',
    'xppai-ax2012-help',
  ]);
  assert.equal(Object.isFrozen(PRODUCT_IDENTITY), true);
  assert.equal(Object.isFrozen(CACHE_IDENTITY), true);
  assert.equal(Object.isFrozen(PUBLIC_SKILLS), true);
});

test('approved AX 2009 baseline is unchanged', () => {
  const result = spawnSync(
    process.execPath,
    ['scripts/verify-ax2009-baseline.js'],
    { cwd: PACKAGE_ROOT, encoding: 'utf8' },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(result.stderr, '', result.stderr);
  assert.match(result.stdout, /AX 2009 baseline verified/i);
});

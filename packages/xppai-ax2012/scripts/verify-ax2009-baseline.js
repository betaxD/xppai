#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const baseline = require('../test/fixtures/ax2009-baseline.json');
const { aggregateHash, compareOrdinal, hashTree } = require('../test/helpers/hash-tree');

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const REPOSITORY_ROOT = path.resolve(PACKAGE_ROOT, '../..');

function run(command, args, cwd) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;

  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env,
  });

  if (result.error) throw result.error;
  return result;
}

function runNpm(args) {
  if (process.platform === 'win32') {
    return run(
      process.env.ComSpec || 'cmd.exe',
      ['/d', '/s', '/c', ['npm', ...args].join(' ')],
      REPOSITORY_ROOT,
    );
  }

  return run('npm', args, REPOSITORY_ROOT);
}

function requireSuccess(result, label) {
  assert.equal(result.status, 0, `${label} failed:\n${result.stderr || result.stdout}`);
  return result.stdout;
}

function sorted(values) {
  return [...values].sort(compareOrdinal);
}

function verifyRootTests() {
  const output = requireSuccess(runNpm(['test']), 'AX 2009 test suite');
  const summary = new RegExp(`^(?:ℹ|#)\\s*tests\\s+${baseline.package.testCount}\\s*$`, 'm');
  assert.match(output, summary, `AX 2009 test count is not ${baseline.package.testCount}`);
}

function verifyPackageArtifact() {
  const output = requireSuccess(runNpm(['pack', '--dry-run', '--json']), 'AX 2009 npm pack dry run');
  const records = JSON.parse(output);
  assert.equal(records.length, 1, 'AX 2009 pack must produce exactly one artifact');

  const artifact = records[0];
  assert.equal(artifact.name, baseline.package.name);
  assert.equal(artifact.version, baseline.package.version);
  assert.equal(artifact.entryCount, baseline.package.entryCount);
  assert.equal(artifact.size, baseline.package.packedSize);
  assert.equal(artifact.unpackedSize, baseline.package.unpackedSize);
  assert.equal(artifact.shasum, baseline.package.shasum);
  assert.deepEqual(sorted(artifact.files.map(({ path: file }) => file)), sorted(baseline.packageFiles));
}

function verifyAssets() {
  const actual = hashTree(REPOSITORY_ROOT, 'assets');
  assert.deepEqual(actual, baseline.assetHashes, 'AX 2009 published asset hashes changed');
  assert.equal(aggregateHash(actual), baseline.aggregateAssetHash, 'AX 2009 aggregate asset hash changed');
}

function verifyCli() {
  const version = requireSuccess(
    run(process.execPath, ['bin/xppai.js', '--version'], REPOSITORY_ROOT),
    'AX 2009 version command',
  ).trim();
  assert.equal(version, baseline.cli.version);

  const skills = requireSuccess(
    run(process.execPath, ['bin/xppai.js', 'list'], REPOSITORY_ROOT),
    'AX 2009 list command',
  ).trim().split(/\r?\n/);
  assert.deepEqual(skills, baseline.cli.skills);

  const assetsPath = requireSuccess(
    run(process.execPath, ['bin/xppai.js', 'path'], REPOSITORY_ROOT),
    'AX 2009 path command',
  ).trim();
  assert.equal(fs.realpathSync(assetsPath), fs.realpathSync(path.join(REPOSITORY_ROOT, 'assets/skills')));
}

function main() {
  const rootPackage = require(path.join(REPOSITORY_ROOT, 'package.json'));
  assert.equal(rootPackage.name, baseline.package.name);
  assert.equal(rootPackage.version, baseline.package.version);

  verifyRootTests();
  verifyPackageArtifact();
  verifyAssets();
  verifyCli();

  process.stdout.write(
    `AX 2009 baseline verified: ${baseline.package.testCount} tests, `
      + `${baseline.package.entryCount} package files, ${Object.keys(baseline.assetHashes).length} published assets\n`,
  );
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`AX 2009 baseline verification failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { main, verifyAssets, verifyCli, verifyPackageArtifact, verifyRootTests };

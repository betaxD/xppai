'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { buildInstallPlan, applyInstallPlan } = require('../../src/ownership/transaction');
const { useTempDir } = require('../helpers/tmp');

function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value, 'utf8');
}

function snapshotTree(root) {
  const values = {};
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(root, absolute).replace(/\\/g, '/');
      if (entry.isDirectory()) visit(absolute);
      else values[relative] = crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
    }
  }
  visit(root);
  return values;
}

function makeRelease(root, name, content) {
  const assetRoot = path.join(root, name, 'assets');
  write(path.join(assetRoot, 'skills', 'xppai-ax2012-core', 'SKILL.md'), content);
  write(path.join(assetRoot, 'commands', 'xppai-ax2012-papai.md'), `command ${content}`);
  return assetRoot;
}

test('manifest failure restores the exact previous multi-destination tree', (t) => {
  const root = useTempDir(t, 'xppai-rollback-');
  const v1 = makeRelease(root, 'v1', 'v1');
  const v2 = makeRelease(root, 'v2', 'v2');
  const targetRoot = path.join(root, 'target');
  const destinations = {
    skills: path.join(targetRoot, 'skills'),
    commands: path.join(targetRoot, 'commands'),
  };
  const first = buildInstallPlan({
    assetRoot: v1,
    destinations,
    target: 'claude',
    mode: 'copy',
    version: '1.0.0',
  });
  applyInstallPlan(first);
  const before = snapshotTree(targetRoot);

  const second = buildInstallPlan({
    assetRoot: v2,
    destinations,
    target: 'claude',
    mode: 'copy',
    version: '2.0.0',
  });
  assert.throws(
    () => applyInstallPlan(second, { failAt: 'manifest-write' }),
    /simulated manifest-write failure/i,
  );
  assert.deepEqual(snapshotTree(targetRoot), before);
});

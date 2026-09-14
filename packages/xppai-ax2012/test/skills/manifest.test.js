'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const {
  loadReferenceManifest,
  validateReference,
} = require('../../src/skills/manifest');
const { useTempDir } = require('../helpers/tmp');

const PACKAGE_ROOT = path.resolve(__dirname, '../..');

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

test('the package reference manifest is a valid AX 2012 R3 routing contract', () => {
  const manifest = loadReferenceManifest(PACKAGE_ROOT);

  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.baseline, '2012-R3');
  assert.deepEqual(manifest.references, []);
});

test('manifest rejects missing references without substituting an AX 2009 fallback', (t) => {
  const root = useTempDir(t, 'xppai-reference-manifest-');
  writeJson(path.join(root, 'assets', 'references', 'manifest.json'), {
    schemaVersion: 1,
    baseline: '2012-R3',
    references: [{
      id: 'platform.missing',
      path: 'platform/missing.md',
      baseline: '2012-R3',
      domains: ['missing'],
      status: 'supported',
    }],
  });

  assert.throws(() => loadReferenceManifest(root), /missing reference: platform\.missing/i);
});

test('manifest rejects a foreign reference baseline', () => {
  const ref = {
    id: 'platform.test',
    path: 'platform/test.md',
    baseline: '2009',
    domains: ['test'],
    status: 'supported',
  };

  assert.throws(
    () => validateReference(ref, __filename),
    /invalid reference contract: platform\.test/i,
  );
});

test('manifest rejects reference paths that escape the canonical asset tree', () => {
  const ref = {
    id: 'platform.escape',
    path: '../outside.md',
    baseline: '2012-R3',
    domains: ['escape'],
    status: 'supported',
  };

  assert.throws(
    () => validateReference(ref, __filename),
    /invalid reference contract: platform\.escape/i,
  );
});

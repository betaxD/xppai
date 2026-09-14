'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { appendRevision } = require('../../src/cache/revision-store');
const { runCli } = require('../helpers/cli');
const { useTempDir } = require('../helpers/tmp');

function object(canonicalType, name, content, contentHash) {
  return { canonicalType, hierarchy: [], name, content, contentHash };
}

function invoke(cacheDir, args) {
  return runCli(['xpo', ...args, '--cache-dir', cacheDir]);
}

test('export-modified writes explicit added and modified files plus removal and comparison manifests', (t) => {
  const root = useTempDir(t, 'xppai-export-');
  const cacheDir = path.join(root, 'cache');
  const outDir = path.join(root, 'out');
  const sourcePath = path.join(root, 'Example.xpo');
  const base = appendRevision({
    cacheDir,
    sourcePath,
    originalBytes: Buffer.from('base'),
    parsed: {
      objects: [
        object('Class', 'A', 'a v1', 'a-v1'),
        object('Class', 'B', 'b v1', 'b-v1'),
      ],
    },
  });
  const head = appendRevision({
    cacheDir,
    sourcePath,
    originalBytes: Buffer.from('head'),
    parsed: {
      objects: [
        object('Class', 'A', 'a v2', 'a-v2'),
        object('Class', 'C', 'c v1', 'c-v1'),
      ],
    },
  });
  assert.equal(invoke(cacheDir, ['snapshot', '--source', sourcePath, '--json']).status, 0);

  const result = invoke(cacheDir, [
    'export-modified',
    '--source', sourcePath,
    '--base', base.revisionId,
    '--head', head.revisionId,
    '--out', outDir,
    '--json',
  ]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(path.join(outDir, 'added', 'Class', 'C.xpo'), 'utf8'), 'c v1');
  assert.equal(fs.readFileSync(path.join(outDir, 'modified', 'Class', 'A.xpo'), 'utf8'), 'a v2');

  const removed = JSON.parse(fs.readFileSync(path.join(outDir, 'removed.json'), 'utf8'));
  assert.deepEqual(removed.objects.map((entry) => entry.key), ['Class:B']);
  const comparison = JSON.parse(fs.readFileSync(path.join(outDir, 'comparison.json'), 'utf8'));
  assert.equal(comparison.sourceId, base.sourceId);
  assert.equal(comparison.baseRevisionId, base.revisionId);
  assert.equal(comparison.headRevisionId, head.revisionId);
  assert.deepEqual(comparison.added, ['Class:C']);
  assert.deepEqual(comparison.modified, ['Class:A']);
  assert.deepEqual(comparison.removed, ['Class:B']);
});

test('export-modified refuses implicit revision selection and leaves output untouched', (t) => {
  const root = useTempDir(t, 'xppai-export-required-');
  const cacheDir = path.join(root, 'cache');
  const outDir = path.join(root, 'out');
  const sourcePath = path.join(root, 'Example.xpo');
  appendRevision({
    cacheDir,
    sourcePath,
    originalBytes: Buffer.from('only'),
    parsed: { objects: [] },
  });
  assert.equal(invoke(cacheDir, ['snapshot', '--source', sourcePath, '--json']).status, 0);

  const result = invoke(cacheDir, [
    'export-modified',
    '--source', sourcePath,
    '--out', outDir,
    '--json',
  ]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /--base and --head are required/i);
  assert.equal(fs.existsSync(outDir), false);
});

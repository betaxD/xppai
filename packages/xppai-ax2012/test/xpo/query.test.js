'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const { appendRevision } = require('../../src/cache/revision-store');
const { runCli } = require('../helpers/cli');
const { useTempDir } = require('../helpers/tmp');

function object(canonicalType, name, content, contentHash, hierarchy = []) {
  return { canonicalType, hierarchy, name, content, contentHash };
}

function invoke(cacheDir, args) {
  return runCli(['xpo', ...args, '--cache-dir', cacheDir]);
}

test('snapshot authorizes bounded list, read, and grep queries for active or explicit revisions', (t) => {
  const root = useTempDir(t, 'xppai-query-');
  const cacheDir = path.join(root, 'cache');
  const sourcePath = path.join(root, 'Example.xpo');
  const first = appendRevision({
    cacheDir,
    sourcePath,
    originalBytes: Buffer.from('first'),
    parsed: { objects: [object('Class', 'A', 'first needle', 'a-v1')] },
  });
  const second = appendRevision({
    cacheDir,
    sourcePath,
    originalBytes: Buffer.from('second'),
    parsed: {
      objects: [
        object('Class', 'A', 'second needle', 'a-v2'),
        object('Table', 'B', 'table body', 'b-v1', ['Data Dictionary']),
      ],
    },
  });

  const unauthorized = invoke(cacheDir, ['list', '--json']);
  assert.notEqual(unauthorized.status, 0);
  assert.match(unauthorized.stderr, /snapshot authorization is required/i);

  const snapshot = invoke(cacheDir, ['snapshot', '--source', sourcePath, '--json']);
  assert.equal(snapshot.status, 0, snapshot.stderr);
  assert.equal(JSON.parse(snapshot.stdout).revisionId, second.revisionId);

  const list = invoke(cacheDir, ['list', '--json']);
  assert.equal(list.status, 0, list.stderr);
  assert.deepEqual(JSON.parse(list.stdout).objects.map((entry) => entry.name), ['A', 'B']);

  const oldList = invoke(cacheDir, ['list', '--revision', first.revisionId, '--json']);
  assert.equal(oldList.status, 0, oldList.stderr);
  assert.deepEqual(JSON.parse(oldList.stdout).objects.map((entry) => entry.name), ['A']);

  const read = invoke(cacheDir, ['read', '--type', 'Class', '--name', 'A', '--json']);
  assert.equal(read.status, 0, read.stderr);
  assert.equal(JSON.parse(read.stdout).object.content, 'second needle');

  const grep = invoke(cacheDir, ['grep', '--contains', 'needle', '--json']);
  assert.equal(grep.status, 0, grep.stderr);
  assert.deepEqual(JSON.parse(grep.stdout).matches.map((entry) => entry.name), ['A']);
});

test('query authorization expires when the append-only index changes', (t) => {
  const root = useTempDir(t, 'xppai-query-auth-');
  const cacheDir = path.join(root, 'cache');
  const sourcePath = path.join(root, 'Example.xpo');
  appendRevision({
    cacheDir,
    sourcePath,
    originalBytes: Buffer.from('first'),
    parsed: { objects: [] },
  });
  assert.equal(invoke(cacheDir, ['snapshot', '--source', sourcePath, '--json']).status, 0);

  appendRevision({
    cacheDir,
    sourcePath,
    originalBytes: Buffer.from('second'),
    parsed: { objects: [] },
  });
  const stale = invoke(cacheDir, ['list', '--json']);
  assert.notEqual(stale.status, 0);
  assert.match(stale.stderr, /snapshot authorization is stale/i);
});

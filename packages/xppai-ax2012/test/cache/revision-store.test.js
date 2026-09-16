'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  appendRevision,
  compareRevisions,
  readIndex,
  readRevision,
  readRevisionBytes,
  setActiveRevision,
} = require('../../src/cache/revision-store');
const { useTempDir } = require('../helpers/tmp');

function bytes(value) {
  return Buffer.from(value, 'utf8');
}

function object(canonicalType, name, content, contentHash, hierarchy = []) {
  return { canonicalType, hierarchy, name, content, contentHash };
}

test('appendRevision preserves history and setActiveRevision moves only the active pointer', (t) => {
  const root = useTempDir(t, 'xppai-revisions-');
  const cacheDir = path.join(root, 'cache');
  const sourcePath = path.join(root, 'Example.xpo');
  const first = appendRevision({
    cacheDir,
    sourcePath,
    originalBytes: bytes('first export'),
    parsed: { objects: [object('Class', 'Example', 'class v1', 'hash-v1')] },
  });
  const second = appendRevision({
    cacheDir,
    sourcePath,
    originalBytes: bytes('second export'),
    parsed: { objects: [object('Class', 'Example', 'class v2', 'hash-v2')] },
  });

  const index = readIndex(cacheDir);
  assert.equal(index.sources.length, 1);
  assert.deepEqual(index.sources[0].revisions.map((entry) => entry.revisionId), [
    first.revisionId,
    second.revisionId,
  ]);
  assert.equal(index.sources[0].activeRevisionId, second.revisionId);
  assert.equal(readRevision(cacheDir, first.revisionId).parsed.objects[0].content, 'class v1');
  assert.equal(readRevision(cacheDir, second.revisionId).parsed.objects[0].content, 'class v2');

  setActiveRevision(cacheDir, first.sourceId, first.revisionId);
  assert.equal(readIndex(cacheDir).sources[0].activeRevisionId, first.revisionId);
  assert.throws(
    () => setActiveRevision(cacheDir, first.sourceId, 'missing-revision'),
    /does not belong to source/i,
  );
});

test('appendRevision is idempotent for the same normalized source and original byte hash', (t) => {
  const root = useTempDir(t, 'xppai-idempotent-');
  const cacheDir = path.join(root, 'cache');
  const sourcePath = path.join(root, 'Example.xpo');
  const input = {
    cacheDir,
    sourcePath,
    originalBytes: bytes('same export'),
    parsed: { objects: [object('Class', 'Example', 'same class', 'same-hash')] },
  };

  const first = appendRevision(input);
  const second = appendRevision(input);
  const source = readIndex(cacheDir).sources[0];

  assert.equal(second.revisionId, first.revisionId);
  assert.equal(source.revisions.length, 1);
  assert.equal(source.activeRevisionId, first.revisionId);
  assert.equal(
    fs.existsSync(path.join(cacheDir, 'extracts', first.sourceId, `${first.byteHash}.json`)),
    true,
  );
  assert.equal(first.byteHash, crypto.createHash('sha256').update(bytes('same export')).digest('hex'));
});

test('compareRevisions reports added, modified, and removed objects and rejects source mismatch', (t) => {
  const root = useTempDir(t, 'xppai-compare-');
  const cacheDir = path.join(root, 'cache');
  const sourcePath = path.join(root, 'Example.xpo');
  const base = appendRevision({
    cacheDir,
    sourcePath,
    originalBytes: bytes('base'),
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
    originalBytes: bytes('head'),
    parsed: {
      objects: [
        object('Class', 'A', 'a v2', 'a-v2'),
        object('Class', 'C', 'c v1', 'c-v1'),
      ],
    },
  });
  const foreign = appendRevision({
    cacheDir,
    sourcePath: path.join(root, 'Other.xpo'),
    originalBytes: bytes('foreign'),
    parsed: { objects: [] },
  });

  const comparison = compareRevisions(
    readRevision(cacheDir, base.revisionId),
    readRevision(cacheDir, head.revisionId),
  );
  assert.deepEqual(comparison.added.map((entry) => entry.key), ['Class:C']);
  assert.deepEqual(comparison.modified.map((entry) => entry.key), ['Class:A']);
  assert.deepEqual(comparison.removed.map((entry) => entry.key), ['Class:B']);
  assert.throws(
    () => compareRevisions(
      readRevision(cacheDir, base.revisionId),
      readRevision(cacheDir, foreign.revisionId),
    ),
    /same source identity/i,
  );
});

test('revision bytes are append-only, idempotent, and validated on read', (t) => {
  const root = useTempDir(t, 'xppai-revision-bytes-');
  const cacheDir = path.join(root, 'cache');
  const originalBytes = Buffer.from([0xff, 0xfe, 0x43, 0x00, 0x4c, 0x00]);
  const input = {
    cacheDir,
    sourcePath: path.join(root, 'Example.xpo'),
    originalBytes,
    parsed: { objects: [] },
  };

  const first = appendRevision(input);
  const second = appendRevision(input);
  const stored = readIndex(cacheDir).sources[0].revisions[0];
  assert.equal(first.revisionId, second.revisionId);
  assert.equal(typeof stored.bytePath, 'string');
  assert.deepEqual(readRevisionBytes(cacheDir, first.revisionId), originalBytes);

  const absoluteBytePath = path.join(cacheDir, stored.bytePath);
  fs.writeFileSync(absoluteBytePath, Buffer.from('corrupt'));
  assert.throws(() => readRevisionBytes(cacheDir, first.revisionId), /byte hash mismatch/i);
  assert.throws(() => appendRevision(input), /collision|corrupt|hash mismatch/i);
  assert.equal(fs.readFileSync(absoluteBytePath, 'utf8'), 'corrupt');
});

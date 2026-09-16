'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const load = require('../../src/commands/xpo/load');
const { readIndex, readRevision, readRevisionBytes } = require('../../src/cache/revision-store');
const { runCli } = require('../helpers/cli');
const { useTempDir } = require('../helpers/tmp');

const FIXTURE = path.join(__dirname, '..', 'fixtures', 'xpo', 'class-table-form-query.xpo');

test('file and stdin intake share one byte parser path and preserve stdin bytes', (t) => {
  const root = useTempDir(t, 'xppai-load-');
  const fileCache = path.join(root, 'file-cache');
  const stdinCache = path.join(root, 'stdin-cache');
  const bytes = fs.readFileSync(FIXTURE);
  const fileResult = load.loadBytes({ bytes, sourcePath: FIXTURE, cacheDir: fileCache });
  const stdin = runCli(
    ['xpo', 'load-stdin', '--cache-dir', stdinCache, '--json'],
    { input: bytes },
  );
  assert.equal(stdin.status, 0, stdin.stderr);
  const stdinResult = JSON.parse(stdin.stdout);

  const fileParsed = readRevision(fileCache, fileResult.revisionId).parsed;
  const stdinParsed = readRevision(stdinCache, stdinResult.revisionId).parsed;
  assert.deepEqual(
    stdinParsed.objects.map((value) => [value.canonicalType, value.name, value.contentHash]),
    fileParsed.objects.map((value) => [value.canonicalType, value.name, value.contentHash]),
  );
  assert.equal(stdinParsed.completeness, fileParsed.completeness);
  assert.deepEqual(fs.readFileSync(stdinResult.sourcePath), bytes);
});

test('strong baseline conflicts stop before any cache mutation', (t) => {
  const root = useTempDir(t, 'xppai-load-conflict-');
  const cacheDir = path.join(root, 'cache');
  assert.throws(() => load.loadBytes({
    bytes: Buffer.from('[ExtensionOf(classStr(Demo))]\nCLASS #Demo_Extension\nENDCLASS\n'),
    sourcePath: path.join(root, 'foreign.xpo'),
    declaredBaseline: 'D365',
    cacheDir,
  }), /baseline conflict/i);
  assert.deepEqual(readIndex(cacheDir).sources, []);
  assert.equal(fs.existsSync(cacheDir), false);
});

test('load reports a corrected-path or paste hint for a missing file', (t) => {
  const root = useTempDir(t, 'xppai-load-missing-');
  const result = runCli([
    'xpo',
    'load',
    path.join(root, 'missing.xpo'),
    '--cache-dir',
    path.join(root, 'cache'),
    '--json',
  ]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /corrected path|paste.*load-stdin/i);
  assert.equal(fs.existsSync(path.join(root, 'cache')), false);
});

test('stdin preservation does not mutate a cache with foreign identity', (t) => {
  const root = useTempDir(t, 'xppai-load-foreign-');
  const cacheDir = path.join(root, 'cache');
  const indexPath = path.join(cacheDir, 'index.json');
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(indexPath, JSON.stringify({
    schemaVersion: 1,
    product: 'Microsoft Dynamics AX',
    baseline: '2009',
    producer: { package: 'xppai', version: '1.0.0' },
    sources: [],
  }));
  const before = fs.readFileSync(indexPath);
  const sourcePath = path.join(cacheDir, 'sources', 'stdin', 'synthetic.xpo');

  assert.throws(() => load.loadBytes({
    bytes: Buffer.from('CLASS #Demo\nENDCLASS\n'),
    sourcePath,
    cacheDir,
    preserveSourceBytes: true,
  }), /cache identity mismatch/i);
  assert.deepEqual(fs.readFileSync(indexPath), before);
  assert.equal(fs.existsSync(sourcePath), false);
});

test('exact revision bytes survive file overwrite and removal for file and stdin intake', (t) => {
  const root = useTempDir(t, 'xppai-load-original-bytes-');
  const bytes = fs.readFileSync(FIXTURE);
  const sourcePath = path.join(root, 'source.xpo');
  const fileCache = path.join(root, 'file-cache');
  fs.writeFileSync(sourcePath, bytes);

  const fileResult = load.loadBytes({
    bytes: fs.readFileSync(sourcePath),
    sourcePath,
    cacheDir: fileCache,
  });
  fs.writeFileSync(sourcePath, 'overwritten');
  fs.unlinkSync(sourcePath);
  assert.deepEqual(readRevisionBytes(fileCache, fileResult.revisionId), bytes);

  const stdinCache = path.join(root, 'stdin-cache');
  const stdin = runCli(
    ['xpo', 'load-stdin', '--cache-dir', stdinCache, '--json'],
    { input: bytes },
  );
  assert.equal(stdin.status, 0, stdin.stderr);
  const stdinResult = JSON.parse(stdin.stdout);
  assert.equal(Object.values(stdinResult).some((value) => Buffer.isBuffer(value)), false);
  fs.unlinkSync(stdinResult.sourcePath);
  assert.deepEqual(readRevisionBytes(stdinCache, stdinResult.revisionId), bytes);
});

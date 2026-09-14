'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const { identityEnvelope, readValidatedJson, writeIdentityJson } = require('../../src/cache/identity');
const { resolveCacheDir, sessionAuthPath } = require('../../src/cache/paths');
const { readSessionAuthorization, writeSessionAuthorization } = require('../../src/cache/session-auth');
const { useTempDir } = require('../helpers/tmp');

test('cache precedence ignores AX 2009 settings', (t) => {
  const local = useTempDir(t, 'xppai-ax2012-config-');
  const oldCache = path.join(local, 'old-cache');
  const newCache = path.join(local, 'new-cache');
  const configured = path.join(local, 'configured-cache');
  const explicit = path.join(local, 'explicit-cache');
  const env = {
    LOCALAPPDATA: local,
    XPPAI_CACHE_DIR: oldCache,
    XPPAI_AX2012_CACHE_DIR: newCache,
  };

  assert.deepEqual(resolveCacheDir({}, env), {
    path: path.resolve(newCache),
    source: 'environment',
  });

  const configDir = path.join(local, 'xppai-ax2012');
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(
    path.join(configDir, 'config.json'),
    JSON.stringify({ ax2012XpoCacheDir: configured, xpoCacheDir: oldCache }),
  );

  assert.deepEqual(resolveCacheDir({}, env), {
    path: path.resolve(configured),
    source: 'user-config',
  });
  assert.deepEqual(resolveCacheDir({ '--cache-dir': explicit }, env), {
    path: path.resolve(explicit),
    source: 'command-line',
  });

  fs.rmSync(path.join(configDir, 'config.json'));
  delete env.XPPAI_AX2012_CACHE_DIR;
  assert.deepEqual(resolveCacheDir({}, env), {
    path: path.join(local, 'xppai-ax2012', 'cache', 'xpo'),
    source: 'default',
  });
});

test('session authorization is always inside the resolved cache directory', () => {
  assert.equal(
    sessionAuthPath(path.join('cache', 'xpo')),
    path.resolve('cache', 'xpo', 'xpo-session-auth.json'),
  );
});

test('foreign cache identity is rejected without mutation', (t) => {
  const directory = useTempDir(t, 'xppai-ax2012-foreign-');
  const indexPath = path.join(directory, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify({
    schemaVersion: 1,
    product: 'Microsoft Dynamics AX',
    baseline: '2009',
    producer: { package: 'xppai', version: '1.0.22' },
  }));
  const before = fs.readFileSync(indexPath);

  assert.throws(() => readValidatedJson(indexPath, 'index'), /identity mismatch.*2012-R3/i);
  assert.deepEqual(fs.readFileSync(indexPath), before);
});

test('older and newer cache schemas have distinct non-mutating diagnostics', (t) => {
  const directory = useTempDir(t, 'xppai-ax2012-schema-');

  for (const [schemaVersion, message] of [[0, /older schema 0/i], [2, /newer schema 2/i]]) {
    const file = path.join(directory, `schema-${schemaVersion}.json`);
    fs.writeFileSync(file, JSON.stringify({
      ...identityEnvelope('0.1.0'),
      schemaVersion,
    }));
    const before = fs.readFileSync(file);

    assert.throws(() => readValidatedJson(file, 'extract'), message);
    assert.deepEqual(fs.readFileSync(file), before);
  }
});

test('identity writes are atomic and include the package producer', (t) => {
  const directory = useTempDir(t, 'xppai-ax2012-write-');
  const recordPath = path.join(directory, 'index.json');

  const record = writeIdentityJson(recordPath, { sources: {} });

  assert.deepEqual(record, {
    schemaVersion: 1,
    product: 'Microsoft Dynamics AX',
    baseline: '2012-R3',
    producer: { package: 'xppai-ax2012', version: '0.1.0' },
    sources: {},
  });
  assert.deepEqual(readValidatedJson(recordPath, 'index'), record);
  assert.deepEqual(fs.readdirSync(directory), ['index.json']);
});

test('session authorization uses the same validated identity envelope', (t) => {
  const cacheDir = useTempDir(t, 'xppai-ax2012-auth-');

  const written = writeSessionAuthorization(cacheDir, { fingerprint: 'synthetic' });

  assert.equal(written.fingerprint, 'synthetic');
  assert.deepEqual(written.producer, { package: 'xppai-ax2012', version: '0.1.0' });
  assert.deepEqual(readSessionAuthorization(cacheDir), written);
  assert.equal(fs.existsSync(path.join(cacheDir, 'xpo-session-auth.json')), true);
});

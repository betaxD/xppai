'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { createManifest, validateOwnedPath } = require('../../src/ownership/manifest');

test('createManifest records the complete package ownership contract', () => {
  const manifest = createManifest({
    version: '1.2.3',
    target: 'claude',
    mode: 'copy',
    destinations: { skills: 'C:/target/skills', commands: 'C:/target/commands' },
    entries: [
      {
        destination: 'skills',
        path: 'xppai-ax2012-core',
        kind: 'copy',
        contentHash: 'abc123',
      },
    ],
  });

  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.package, 'xppai-ax2012');
  assert.equal(manifest.version, '1.2.3');
  assert.equal(manifest.target, 'claude');
  assert.equal(manifest.mode, 'copy');
  assert.deepEqual(manifest.destinations, {
    skills: 'C:/target/skills',
    commands: 'C:/target/commands',
  });
  assert.equal(manifest.entries[0].contentHash, 'abc123');
});

test('validateOwnedPath accepts only relative AX 2012 namespace entries', () => {
  for (const valid of ['xppai-ax2012-core', 'xppai-ax2012-papai.md']) {
    assert.equal(validateOwnedPath(valid), valid);
  }
  for (const invalid of [
    '../xppai-ax2012-core',
    'nested/../xppai-ax2012-core',
    'xppai-core',
    'C:\\target\\xppai-ax2012-core',
    '/target/xppai-ax2012-core',
  ]) {
    assert.throws(() => validateOwnedPath(invalid), /owned path/i, invalid);
  }
});

test('createManifest rejects entries outside resolved destinations or without mode evidence', () => {
  assert.throws(() => createManifest({
    version: '1.0.0',
    target: 'codex',
    mode: 'copy',
    destinations: { skills: 'C:/target/skills' },
    entries: [{ destination: 'commands', path: 'xppai-ax2012-papai.md', kind: 'copy' }],
  }), /manifest entry/i);
});

'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { test } = require('node:test');

const { PACKAGE_ROOT, runCli } = require('../helpers/cli');

test('CLI reports only the AX 2012 package identity', () => {
  for (const flag of ['--version', '-v']) {
    const result = runCli([flag]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, '');
    assert.equal(result.stdout.trim(), '0.1.1');
  }
});

test('CLI help exposes the complete first-release command surface', () => {
  const result = runCli(['--help']);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  for (const command of ['list', 'path', 'install', 'export', 'xpo']) {
    assert.match(result.stdout, new RegExp(`\\b${command}\\b`));
  }
  for (const command of ['load', 'load-stdin', 'snapshot', 'list', 'read', 'grep', 'export-modified']) {
    assert.match(result.stdout, new RegExp(`\\b${command}\\b`));
  }
  assert.doesNotMatch(result.stdout, /AX 2009|D365/i);
});

test('path resolves only the sibling canonical asset tree', () => {
  const result = runCli(['path']);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  assert.equal(result.stdout.trim(), path.join(PACKAGE_ROOT, 'assets', 'skills'));
});

test('parseArgs preserves command positionals and normalizes short flags', () => {
  const { parseArgs } = require('../../src/cli');

  assert.deepEqual(parseArgs(['xpo', 'load', 'sample.xpo', '--cache-dir', 'cache', '-h']), {
    command: 'xpo',
    positionals: ['xpo', 'load', 'sample.xpo'],
    flags: { '--cache-dir': 'cache', '--help': true },
  });
});

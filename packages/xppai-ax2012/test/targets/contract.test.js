'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const { loadTarget, TARGETS } = require('../../src/targets');

test('target adapters expose exact install and export layouts', () => {
  const homeDir = path.resolve('virtual-home');
  const cwd = path.resolve('virtual-repository');
  const out = path.resolve('virtual-export');
  const expected = {
    claude: {
      install: {
        skills: path.join(homeDir, '.claude', 'skills'),
        commands: path.join(homeDir, '.claude', 'commands'),
      },
      export: { skills: path.join(out, 'skills'), commands: path.join(out, 'commands') },
    },
    codex: {
      install: { skills: path.join(homeDir, '.codex', 'skills') },
      export: { skills: path.join(out, 'skills') },
    },
    qwen: {
      install: { skills: path.join(homeDir, '.qwen', 'skills') },
      export: { skills: path.join(out, 'skills') },
    },
    copilot: {
      install: { skills: path.join(cwd, '.github', 'skills') },
      export: { skills: path.join(out, '.github', 'skills') },
    },
    generic: {
      install: null,
      export: { skills: path.join(out, 'skills'), commands: path.join(out, 'commands') },
    },
  };

  assert.deepEqual(Object.keys(TARGETS).sort(), Object.keys(expected).sort());
  for (const [id, contract] of Object.entries(expected)) {
    const adapter = loadTarget(id);
    assert.equal(adapter.id, id);
    assert.deepEqual(adapter.resolveInstallDestinations({ homeDir, cwd }), contract.install);
    assert.deepEqual(adapter.resolveExportDestinations(out), contract.export);
  }
});

test('unknown targets are rejected without terminating the process', () => {
  assert.throws(() => loadTarget('unknown'), /unknown target/i);
});

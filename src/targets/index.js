'use strict';

const TARGETS = {
  claude:  require('./claude'),
  codex:   require('./codex'),
  copilot: require('./copilot'),
  generic: require('./generic'),
};

function loadTarget(name) {
  const adapter = TARGETS[name];
  if (!adapter) {
    process.stderr.write(
      `error: unknown target "${name}"\nvalid targets: ${Object.keys(TARGETS).join(', ')}\n`
    );
    process.exit(1);
  }
  return adapter;
}

module.exports = { loadTarget, TARGETS };

'use strict';

const TARGETS = Object.freeze({
  claude: require('./claude'),
  codex: require('./codex'),
  qwen: require('./qwen'),
  copilot: require('./copilot'),
  generic: require('./generic'),
});

function loadTarget(name) {
  const adapter = TARGETS[name];
  if (!adapter) throw new Error(`unknown target "${name}"; expected ${Object.keys(TARGETS).join(', ')}`);
  return adapter;
}

module.exports = { loadTarget, TARGETS };

'use strict';

const assets = require('../assets');
const { applyInstallPlan, buildInstallPlan } = require('../ownership/transaction');
const { loadTarget } = require('../targets');
const packageVersion = require('../../package.json').version;

const INSTALL_TARGETS = Object.freeze(['claude', 'codex', 'qwen', 'copilot']);

function install(flags, _positionals, context = {}) {
  const requested = flags['--target'];
  if (!requested || requested === true) throw new Error('install requires --target');
  const mode = flags['--mode'] || 'copy';
  const targetIds = requested === 'all' ? INSTALL_TARGETS : [String(requested)];
  const results = [];

  for (const targetId of targetIds) {
    const adapter = loadTarget(targetId);
    const destinations = adapter.resolveInstallDestinations({
      homeDir: context.homeDir,
      cwd: context.cwd,
    });
    if (!destinations) throw new Error(`target "${targetId}" is export-only and cannot be installed`);
    const plan = buildInstallPlan({
      assetRoot: context.assetRoot || assets.root(),
      destinations,
      target: targetId,
      mode,
      version: packageVersion,
    });
    const manifest = applyInstallPlan(plan, context.transactionOptions);
    const result = { target: targetId, destinations, manifest };
    results.push(result);
    if (!context.quiet) process.stdout.write(`installed ${targetId} to ${destinations.skills}\n`);
  }
  return results;
}

module.exports = install;
module.exports.INSTALL_TARGETS = INSTALL_TARGETS;

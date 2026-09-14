'use strict';

const assets = require('../assets');
const { applyInstallPlan, buildInstallPlan } = require('../ownership/transaction');
const { loadTarget } = require('../targets');
const packageVersion = require('../../package.json').version;

function exportCommand(flags, _positionals, context = {}) {
  const targetId = flags['--target'];
  const outDir = flags['--out'];
  if (!targetId || targetId === true) throw new Error('export requires --target');
  if (!outDir || outDir === true) throw new Error('export requires --out');
  const mode = flags['--mode'] || 'copy';
  const adapter = loadTarget(String(targetId));
  const destinations = adapter.resolveExportDestinations(outDir);
  const plan = buildInstallPlan({
    assetRoot: context.assetRoot || assets.root(),
    destinations,
    target: String(targetId),
    mode,
    version: packageVersion,
  });
  const manifest = applyInstallPlan(plan, context.transactionOptions);
  const result = { target: String(targetId), outDir: require('node:path').resolve(String(outDir)), destinations, manifest };
  if (!context.quiet) process.stdout.write(`exported ${targetId} to ${result.outDir}\n`);
  return result;
}

module.exports = exportCommand;

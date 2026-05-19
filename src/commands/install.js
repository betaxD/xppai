'use strict';

const assets = require('../assets');
const { loadTarget, TARGETS } = require('../targets');

const INSTALL_TARGETS = ['claude', 'codex', 'qwen', 'copilot'];

module.exports = function install(flags, _args) {
  const target = flags['--target'];

  if (!target) {
    process.stderr.write('error: --target is required\n');
    process.exit(1);
  }

  const targets = target === 'all' ? INSTALL_TARGETS : [target];
  const mode = flags['--mode'] || 'copy';

  for (const targetName of targets) {
    const adapter = loadTarget(targetName);
    const installDir = adapter.resolveInstallDir(flags);

    if (!installDir) {
      process.stderr.write(
        `error: target "${targetName}" does not define a default install location\n` +
        `use "xppai export --target ${targetName} --out <dir>" instead\n`
      );
      process.exit(1);
    }

    adapter.export(assets.path(), installDir, { mode });
    process.stdout.write(`installed ${targetName} to ${installDir}\n`);
  }
};

module.exports.INSTALL_TARGETS = INSTALL_TARGETS.filter(name => TARGETS[name]);

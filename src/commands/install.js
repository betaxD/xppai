'use strict';

const assets = require('../assets');
const { loadTarget } = require('../targets');

module.exports = function install(args) {
  const target = args['--target'];

  if (!target) {
    process.stderr.write('error: --target is required\n');
    process.exit(1);
  }

  const adapter = loadTarget(target);
  const installDir = adapter.resolveInstallDir(args);

  if (!installDir) {
    process.stderr.write(
      `error: target "${target}" does not define a default install location\n` +
      `use "xppai export --target ${target} --out <dir>" instead\n`
    );
    process.exit(1);
  }

  const mode = args['--mode'] || 'copy';
  adapter.export(assets.path(), installDir, { mode });
  process.stdout.write(`installed to ${installDir}\n`);
};

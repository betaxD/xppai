'use strict';

const XPO_COMMANDS = Object.freeze([
  'load',
  'load-stdin',
  'snapshot',
  'list',
  'read',
  'grep',
  'export-modified',
]);

function printHelp() {
  process.stdout.write(
    'usage: xppai-ax2012 xpo <command> [options]\n'
      + `commands: ${XPO_COMMANDS.join(', ')}\n`,
  );
}

function run(flags, positionals) {
  if (flags['--help'] || positionals.length === 0) {
    printHelp();
    return;
  }

  throw new Error(`xpo command "${positionals[0]}" is not implemented yet`);
}

module.exports = run;
module.exports.XPO_COMMANDS = XPO_COMMANDS;
module.exports.printHelp = printHelp;

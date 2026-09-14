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

  const handlers = {
    snapshot: require('./snapshot'),
    list: require('./list'),
    read: require('./read'),
    grep: require('./grep'),
    'export-modified': require('./export-modified'),
  };
  const command = positionals[0];
  const handler = handlers[command];
  if (!handler) throw new Error(`xpo command "${command}" is not implemented yet`);
  return handler(flags, positionals.slice(1));
}

module.exports = run;
module.exports.XPO_COMMANDS = XPO_COMMANDS;
module.exports.printHelp = printHelp;

'use strict';

const TOP_LEVEL_COMMANDS = Object.freeze(['list', 'path', 'install', 'export', 'xpo']);

function parseArgs(argv) {
  const flags = {};
  const positionals = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '-h') {
      flags['--help'] = true;
    } else if (argument === '-v') {
      flags['--version'] = true;
    } else if (argument.startsWith('--')) {
      const next = argv[index + 1];
      flags[argument] = next !== undefined && !next.startsWith('-') ? next : true;
      if (flags[argument] !== true) index += 1;
    } else if (!argument.startsWith('-')) {
      positionals.push(argument);
    }
  }

  return { command: positionals[0] || null, positionals, flags };
}

function printHelp() {
  const { XPO_COMMANDS } = require('./commands/xpo');
  process.stdout.write(
    'xppai-ax2012 - Microsoft Dynamics AX 2012 R3 skill suite\n'
      + 'usage: xppai-ax2012 <command> [options]\n'
      + '       xppai-ax2012 --help\n'
      + '       xppai-ax2012 --version\n'
      + `commands: ${TOP_LEVEL_COMMANDS.join(', ')}\n`
      + `xpo commands: ${XPO_COMMANDS.join(', ')}\n`,
  );
}

function unavailable(command) {
  throw new Error(`${command} is not implemented yet`);
}

async function run(argv = process.argv) {
  const { command, positionals, flags } = parseArgs(argv.slice(2));

  if (flags['--version']) {
    process.stdout.write(`${require('../package.json').version}\n`);
    return;
  }
  if (flags['--help']) {
    printHelp();
    return;
  }
  if (!command) {
    printHelp();
    process.exitCode = 1;
    return;
  }

  const handlers = {
    list: require('./commands/list'),
    path: require('./commands/path'),
    install: () => unavailable('install'),
    export: () => unavailable('export'),
    xpo: require('./commands/xpo'),
  };
  const handler = handlers[command];
  if (!handler) throw new Error(`unknown command "${command}"; expected ${TOP_LEVEL_COMMANDS.join(', ')}`);

  await handler(flags, positionals.slice(1));
}

module.exports = { parseArgs, printHelp, run };

'use strict';

const COMMANDS = {
  list:    require('./commands/list'),
  path:    require('./commands/path'),
  export:  require('./commands/export'),
  install: require('./commands/install'),
};

function parseArgs(argv) {
  const args = {};
  let command = null;
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (!command && !arg.startsWith('-')) {
      command = arg;
    } else if (arg.startsWith('--')) {
      const next = argv[i + 1];
      args[arg] = (next !== undefined && !next.startsWith('--')) ? next : true;
      if (next !== undefined && !next.startsWith('--')) i++;
    }
    i++;
  }
  return { command, args };
}

function run(argv) {
  const { command, args } = parseArgs(argv.slice(2));
  const handler = COMMANDS[command];
  if (!handler) {
    const valid = Object.keys(COMMANDS).join(', ');
    process.stderr.write(
      `error: unknown command "${command}"\n` +
      `valid commands: ${valid}\n` +
      `usage: xppai <command> [options]\n`
    );
    process.exit(1);
  }
  handler(args);
}

module.exports = { run };

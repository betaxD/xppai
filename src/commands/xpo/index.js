'use strict';

const load = require('./load');
const loadDir = require('./load-dir');
const loadStdin = require('./load-stdin');
const cacheCopy = require('./cache-copy');
const cacheUse = require('./cache-use');
const cacheShow = require('./cache-show');
const exportModified = require('./export-modified');
const list = require('./list');
const read = require('./read');
const grep = require('./grep');
const snapshot = require('./snapshot');

module.exports = function xpo(flags, args) {
  const sub = args[0];
  const rest = args.slice(1);

  if (sub === 'analyze-load') return load(flags, rest);
  if (sub === 'analyze-snapshot') return snapshot({ ...flags, '--json': true }, rest);
  if (sub === 'analyze-list') return list(flags, rest);
  if (sub === 'analyze-read') return read(flags, rest);
  if (sub === 'analyze-grep') return grep(flags, rest);
  if (sub === 'load') return load(flags, rest);
  if (sub === 'load-dir') return loadDir(flags, rest);
  if (sub === 'load-stdin') return loadStdin(flags, rest);
  if (sub === 'cache-copy') return cacheCopy(flags, rest);
  if (sub === 'cache-use') return cacheUse(flags, rest);
  if (sub === 'cache-show') return cacheShow(flags, rest);
  if (sub === 'list') return list(flags, rest);
  if (sub === 'read') return read(flags, rest);
  if (sub === 'grep') return grep(flags, rest);
  if (sub === 'snapshot') return snapshot(flags, rest);
  if (sub === 'export-modified') return exportModified(flags, rest);

  process.stderr.write(
    'error: unknown xpo subcommand\n' +
    'usage:\n' +
    '  xppai xpo load <file> [--cache-dir <dir>]\n' +
    '  xppai xpo load-dir <dir> [--ext .xpo] [--cache-dir <dir>]\n' +
    '  xppai xpo analyze-load <file> [--cache-dir <dir>]\n' +
    '  xppai xpo load-stdin [--name <virtual-file-name>] [--cache-dir <dir>]\n' +
    '  xppai xpo cache-copy <dest> [--yes] [--cache-dir <dir>]\n' +
    '  xppai xpo cache-use <dir>\n' +
    '  xppai xpo cache-show [--cache-dir <dir>]\n' +
    '  xppai xpo snapshot [--file <path>] [--type <T>] [--limit <n>] [--json] [--cache-dir <dir>]\n' +
    '  xppai xpo analyze-snapshot [--file <path>] [--type <T>] [--limit <n>] [--cache-dir <dir>]  (JSON always on)\n' +
    '  xppai xpo list [--type <T>] [--file <path>] [--json] [--cache-dir <dir>]\n' +
    '  xppai xpo analyze-list [--type <T>] [--file <path>] [--json] [--cache-dir <dir>]\n' +
    '  xppai xpo read --type <T> --name <N> [--file <path>] [--json] [--cache-dir <dir>]\n' +
    '  xppai xpo analyze-read --type <T> --name <N> [--file <path>] [--json] [--cache-dir <dir>]\n' +
    '  xppai xpo grep --contains <text> [--type <T>] [--file <path>] [--limit <n>] [--json] [--cache-dir <dir>]\n' +
    '  xppai xpo analyze-grep --contains <text> [--type <T>] [--file <path>] [--limit <n>] [--json] [--cache-dir <dir>]\n' +
    '  xppai xpo export-modified --out <dir> [--file <xpo-file>] [--cache-dir <dir>]\n'
  );
  process.exit(1);
};

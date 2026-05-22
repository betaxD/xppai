'use strict';

const fs = require('fs');
const nodePath = require('path');
const { loadFromRaw, clearCacheDir } = require('./load');
const { resolveCacheDir, ensureCacheStructure } = require('../../cache/paths');

function findXpoFiles(dir, ext) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = nodePath.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findXpoFiles(full, ext));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(ext)) {
      results.push(full);
    }
  }
  return results.sort();
}

module.exports = function loadDir(flags, args) {
  const dirArg = args[0];
  if (!dirArg) {
    process.stderr.write('error: xppai xpo load-dir requires <directory>\n');
    process.exit(1);
  }

  const absDir = nodePath.resolve(dirArg);
  if (!fs.existsSync(absDir) || !fs.statSync(absDir).isDirectory()) {
    process.stderr.write(`error: directory not found: ${absDir}\n`);
    process.exit(1);
  }

  const ext = flags['--ext'] ? String(flags['--ext']).toLowerCase() : '.xpo';
  const files = findXpoFiles(absDir, ext);

  if (!files.length) {
    process.stderr.write(`error: no *${ext} files found in: ${absDir}\n`);
    process.exit(1);
  }

  const cacheDir = resolveCacheDir(flags);
  clearCacheDir(cacheDir);
  ensureCacheStructure(cacheDir);

  process.stdout.write(`loading ${files.length} XPO file(s) from: ${absDir}\n\n`);

  let loaded = 0;
  let failed = 0;
  for (const file of files) {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      loadFromRaw(flags, raw, file, { preserveCache: true });
      loaded++;
    } catch (err) {
      process.stderr.write(`warning: skipped ${nodePath.basename(file)}: ${err.message}\n`);
      failed++;
    }
  }

  process.stdout.write(
    `\ndone: ${loaded} loaded` + (failed ? `, ${failed} failed` : '') + '\n' +
    'next: run `xppai xpo snapshot` to authorize the cache for analysis\n'
  );
};

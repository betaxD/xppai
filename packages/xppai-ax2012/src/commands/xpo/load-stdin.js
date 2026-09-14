'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const { resolveCacheDir } = require('../../cache/paths');
const { loadBytes } = require('./load');

function loadStdin(flags) {
  const bytes = fs.readFileSync(0);
  if (bytes.length === 0) throw new Error('xpo load-stdin requires pasted XPO bytes on stdin');
  const cacheDir = resolveCacheDir(flags).path;
  const byteHash = crypto.createHash('sha256').update(bytes).digest('hex');
  const sourcePath = path.join(cacheDir, 'sources', 'stdin', `${byteHash}.xpo`);
  const result = loadBytes({
    bytes,
    sourcePath,
    cacheDir,
    preserveSourceBytes: true,
    declaredBaseline: flags['--baseline'],
    layer: flags['--layer'],
    model: flags['--model'],
    build: flags['--build'],
  });
  if (flags['--json']) process.stdout.write(`${JSON.stringify(result)}\n`);
  else process.stdout.write(`loaded ${result.objectCount} stdin objects as ${result.revisionId}\n`);
  return result;
}

module.exports = loadStdin;

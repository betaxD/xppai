'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { resolveCacheDir } = require('../../cache/paths');
const { appendRevision, readIndex } = require('../../cache/revision-store');
const { parseXpo } = require('../../xpo/parser');

function preserveBytes(file, bytes) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  try {
    fs.writeFileSync(file, bytes, { flag: 'wx' });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    if (!fs.readFileSync(file).equals(bytes)) {
      throw new Error(`preserved stdin source hash collision at ${file}`);
    }
  }
}

function loadBytes({
  bytes,
  sourcePath,
  declaredBaseline,
  cacheDir,
  preserveSourceBytes = false,
  layer,
  model,
  build,
}) {
  const resolvedSourcePath = path.resolve(String(sourcePath));
  const parsed = parseXpo(bytes, {
    sourcePath: resolvedSourcePath,
    declaredBaseline,
    layer,
    model,
    build,
  });
  const strongConflicts = parsed.baseline.conflicts.filter((value) => value.strength === 'strong');
  if (strongConflicts.length) {
    throw new Error(`baseline conflict: ${strongConflicts.map((value) => value.evidence).join(', ')}`);
  }
  readIndex(cacheDir);
  if (preserveSourceBytes) preserveBytes(resolvedSourcePath, Buffer.from(bytes));
  const revision = appendRevision({ cacheDir, sourcePath: resolvedSourcePath, originalBytes: bytes, parsed });
  return {
    ...revision,
    sourcePath: resolvedSourcePath,
    completeness: parsed.completeness,
    objectCount: parsed.objects.length,
    fragmentCount: parsed.fragments.length,
    baseline: parsed.baseline,
  };
}

function load(flags, positionals) {
  const suppliedPath = positionals[0];
  if (!suppliedPath) throw new Error('xpo load requires a file path; provide a corrected path or paste with xpo load-stdin');
  const sourcePath = path.resolve(String(suppliedPath));
  let bytes;
  try {
    bytes = fs.readFileSync(sourcePath);
  } catch (error) {
    throw new Error(
      `cannot read XPO at ${sourcePath}; provide a corrected path or paste the content with xpo load-stdin: ${error.message}`,
    );
  }
  const cacheDir = resolveCacheDir(flags).path;
  const result = loadBytes({
    bytes,
    sourcePath,
    cacheDir,
    declaredBaseline: flags['--baseline'],
    layer: flags['--layer'],
    model: flags['--model'],
    build: flags['--build'],
  });
  if (flags['--json']) process.stdout.write(`${JSON.stringify(result)}\n`);
  else process.stdout.write(`loaded ${result.objectCount} objects as ${result.revisionId}\n`);
  return result;
}

module.exports = load;
module.exports.loadBytes = loadBytes;

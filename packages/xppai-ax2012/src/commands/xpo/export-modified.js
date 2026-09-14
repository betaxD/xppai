'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { resolveCacheDir } = require('../../cache/paths');
const { requireSessionAuthorization } = require('../../cache/session-auth');
const {
  compareRevisions,
  readRevision,
  sourceIdForPath,
} = require('../../cache/revision-store');

function safeSegment(value) {
  return String(value).replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').replace(/[. ]+$/g, '_') || '_';
}

function objectPath(root, category, value) {
  const segments = [
    root,
    category,
    safeSegment(value.canonicalType),
    ...(value.hierarchy || []).map(safeSegment),
    `${safeSegment(value.name)}.xpo`,
  ];
  return path.join(...segments);
}

function writeText(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, String(content || ''), 'utf8');
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function run(flags) {
  if (!flags['--source'] || flags['--source'] === true) throw new Error('xpo export-modified requires --source');
  if (!flags['--base'] || flags['--base'] === true || !flags['--head'] || flags['--head'] === true) {
    throw new Error('xpo export-modified: --base and --head are required');
  }
  if (!flags['--out'] || flags['--out'] === true) throw new Error('xpo export-modified requires --out');

  const cacheDir = resolveCacheDir(flags).path;
  const authorization = requireSessionAuthorization(cacheDir);
  const expectedSourceId = sourceIdForPath(flags['--source']);
  if (authorization.sourceId !== expectedSourceId) {
    throw new Error('snapshot authorization does not match the requested source');
  }
  const base = readRevision(cacheDir, String(flags['--base']));
  const head = readRevision(cacheDir, String(flags['--head']));
  if (base.sourceId !== expectedSourceId || head.sourceId !== expectedSourceId) {
    throw new Error('base and head revisions must belong to the requested source identity');
  }
  const comparison = compareRevisions(base, head);
  const outDir = path.resolve(String(flags['--out']));

  for (const entry of comparison.added) {
    writeText(objectPath(outDir, 'added', entry.object), entry.object.content);
  }
  for (const entry of comparison.modified) {
    writeText(objectPath(outDir, 'modified', entry.head), entry.head.content);
  }
  writeJson(path.join(outDir, 'removed.json'), {
    sourceId: comparison.sourceId,
    baseRevisionId: comparison.baseRevisionId,
    headRevisionId: comparison.headRevisionId,
    objects: comparison.removed,
  });
  const manifest = {
    sourceId: comparison.sourceId,
    baseRevisionId: comparison.baseRevisionId,
    headRevisionId: comparison.headRevisionId,
    added: comparison.added.map((entry) => entry.key),
    modified: comparison.modified.map((entry) => entry.key),
    removed: comparison.removed.map((entry) => entry.key),
  };
  writeJson(path.join(outDir, 'comparison.json'), manifest);

  const result = { outDir, ...manifest };
  if (flags['--json']) process.stdout.write(`${JSON.stringify(result)}\n`);
  else process.stdout.write(`exported comparison to ${outDir}\n`);
  return result;
}

module.exports = run;

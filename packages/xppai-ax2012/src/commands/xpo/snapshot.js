'use strict';

const { resolveCacheDir } = require('../../cache/paths');
const {
  cacheFingerprint,
  normalizeCacheDir,
  writeSessionAuthorization,
} = require('../../cache/session-auth');
const { selectRevision } = require('../../cache/revision-store');

function run(flags) {
  if (!flags['--source']) throw new Error('xpo snapshot requires --source');
  const cacheDir = resolveCacheDir(flags).path;
  const { source, revision } = selectRevision(cacheDir, {
    sourcePath: flags['--source'],
    revisionId: flags['--revision'] === true ? null : flags['--revision'],
  });
  writeSessionAuthorization(cacheDir, {
    cacheDir: normalizeCacheDir(cacheDir),
    sourceId: source.sourceId,
    revisionId: revision.revisionId,
    indexFingerprint: cacheFingerprint(cacheDir),
    authorizedAt: new Date().toISOString(),
  });
  const result = {
    cacheDir,
    sourceId: source.sourceId,
    sourcePath: source.sourcePath,
    revisionId: revision.revisionId,
    objectCount: revision.parsed.objects.length,
  };
  if (flags['--json']) process.stdout.write(`${JSON.stringify(result)}\n`);
  else process.stdout.write(`authorized ${result.revisionId} (${result.objectCount} objects)\n`);
  return result;
}

module.exports = run;

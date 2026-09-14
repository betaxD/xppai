'use strict';

const { resolveCacheDir } = require('../../cache/paths');
const { requireSessionAuthorization } = require('../../cache/session-auth');
const { objectKey, selectRevision } = require('../../cache/revision-store');

function run(flags) {
  const cacheDir = resolveCacheDir(flags).path;
  const authorization = requireSessionAuthorization(cacheDir);
  const { revision } = selectRevision(cacheDir, {
    sourceId: authorization.sourceId,
    revisionId: flags['--revision'] === true ? null : flags['--revision'],
  });
  const objects = revision.parsed.objects
    .map((value) => ({
      key: objectKey(value),
      canonicalType: value.canonicalType,
      hierarchy: value.hierarchy || [],
      name: value.name,
      contentHash: value.contentHash,
    }))
    .sort((left, right) => left.key.localeCompare(right.key));
  const result = { sourceId: revision.sourceId, revisionId: revision.revisionId, objects };
  if (flags['--json']) process.stdout.write(`${JSON.stringify(result)}\n`);
  else process.stdout.write(`${objects.map((value) => value.key).join('\n')}${objects.length ? '\n' : ''}`);
  return result;
}

module.exports = run;

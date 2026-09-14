'use strict';

const { resolveCacheDir } = require('../../cache/paths');
const { requireSessionAuthorization } = require('../../cache/session-auth');
const { objectKey, selectRevision } = require('../../cache/revision-store');

function run(flags) {
  if (!flags['--contains'] || flags['--contains'] === true) throw new Error('xpo grep requires --contains');
  const cacheDir = resolveCacheDir(flags).path;
  const authorization = requireSessionAuthorization(cacheDir);
  const { revision } = selectRevision(cacheDir, {
    sourceId: authorization.sourceId,
    revisionId: flags['--revision'] === true ? null : flags['--revision'],
  });
  const needle = String(flags['--contains']).toLowerCase();
  const matches = revision.parsed.objects
    .filter((value) => String(value.content || '').toLowerCase().includes(needle))
    .map((value) => ({
      key: objectKey(value),
      canonicalType: value.canonicalType,
      hierarchy: value.hierarchy || [],
      name: value.name,
      contentHash: value.contentHash,
    }))
    .sort((left, right) => left.key.localeCompare(right.key));
  const result = { sourceId: revision.sourceId, revisionId: revision.revisionId, matches };
  if (flags['--json']) process.stdout.write(`${JSON.stringify(result)}\n`);
  else process.stdout.write(`${matches.map((value) => value.key).join('\n')}${matches.length ? '\n' : ''}`);
  return result;
}

module.exports = run;

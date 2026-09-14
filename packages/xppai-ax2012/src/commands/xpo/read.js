'use strict';

const { resolveCacheDir } = require('../../cache/paths');
const { requireSessionAuthorization } = require('../../cache/session-auth');
const { selectRevision } = require('../../cache/revision-store');

function run(flags) {
  if (!flags['--type'] || flags['--type'] === true) throw new Error('xpo read requires --type');
  if (!flags['--name'] || flags['--name'] === true) throw new Error('xpo read requires --name');
  const cacheDir = resolveCacheDir(flags).path;
  const authorization = requireSessionAuthorization(cacheDir);
  const { revision } = selectRevision(cacheDir, {
    sourceId: authorization.sourceId,
    revisionId: flags['--revision'] === true ? null : flags['--revision'],
  });
  const object = revision.parsed.objects.find((value) => (
    value.canonicalType.toLowerCase() === String(flags['--type']).toLowerCase()
      && value.name.toLowerCase() === String(flags['--name']).toLowerCase()
  ));
  if (!object) throw new Error(`object ${flags['--type']}:${flags['--name']} was not found`);
  const result = { sourceId: revision.sourceId, revisionId: revision.revisionId, object };
  if (flags['--json']) process.stdout.write(`${JSON.stringify(result)}\n`);
  else process.stdout.write(`${object.content || ''}${String(object.content || '').endsWith('\n') ? '' : '\n'}`);
  return result;
}

module.exports = run;

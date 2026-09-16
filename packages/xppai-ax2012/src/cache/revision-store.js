'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const { readValidatedJson, writeIdentityJson } = require('./identity');

const INDEX_FILE = 'index.json';

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizeSourcePath(sourcePath) {
  if (!sourcePath) throw new Error('source path is required');
  return path.resolve(String(sourcePath)).replace(/\\/g, '/').toLowerCase();
}

function sourceIdForPath(sourcePath) {
  return sha256(normalizeSourcePath(sourcePath));
}

function objectKey(value) {
  return [value.canonicalType, ...(value.hierarchy || []), value.name].join(':');
}

function indexPath(cacheDir) {
  return path.join(path.resolve(cacheDir), INDEX_FILE);
}

function emptyIndex() {
  return { sources: [] };
}

function readIndex(cacheDir) {
  const file = indexPath(cacheDir);
  if (!fs.existsSync(file)) return emptyIndex();
  const index = readValidatedJson(file, 'revision index');
  if (!Array.isArray(index.sources)) throw new Error('revision index sources must be an array');
  return index;
}

function writeIndex(cacheDir, index) {
  return writeIdentityJson(indexPath(cacheDir), { sources: index.sources });
}

function extractRelativePath(sourceId, byteHash) {
  return path.join('extracts', sourceId, `${byteHash}.json`);
}

function byteRelativePath(sourceId, byteHash) {
  return path.join('bytes', sourceId, `${byteHash}.xpo`);
}

function resolveCachePath(cacheDir, relativePath) {
  if (typeof relativePath !== 'string' || !relativePath) {
    throw new Error('revision byte path is missing');
  }
  const root = path.resolve(cacheDir);
  const resolved = path.resolve(root, relativePath);
  const relation = path.relative(root, resolved);
  if (relation.startsWith('..') || path.isAbsolute(relation)) {
    throw new Error(`revision byte path escapes cache: ${relativePath}`);
  }
  return resolved;
}

function validateByteArtifact(file, byteHash, expectedBytes = null) {
  let stored;
  try {
    stored = fs.readFileSync(file);
  } catch (error) {
    throw new Error(`cannot read revision bytes at ${file}: ${error.message}`);
  }
  if (sha256(stored) !== byteHash) {
    throw new Error(`revision byte hash mismatch at ${file}`);
  }
  if (expectedBytes && !stored.equals(Buffer.from(expectedBytes))) {
    throw new Error(`revision byte hash collision at ${file}`);
  }
  return stored;
}

function preserveByteArtifact(file, originalBytes, byteHash) {
  const bytes = Buffer.from(originalBytes);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  let descriptor;
  let created = false;
  try {
    descriptor = fs.openSync(file, 'wx', 0o600);
    created = true;
    fs.writeFileSync(descriptor, bytes);
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = undefined;
  } catch (error) {
    if (descriptor !== undefined) fs.closeSync(descriptor);
    if (error.code !== 'EEXIST') {
      if (created) fs.rmSync(file, { force: true });
      throw error;
    }
  }
  validateByteArtifact(file, byteHash, bytes);
}

function backfillRevisionBytes(cacheDir, revision, originalBytes, byteHash, relativeBytes) {
  if (revision.byteHash !== byteHash) {
    throw new Error(`revision ${revision.revisionId} byte hash mismatch`);
  }
  if (revision.bytePath !== undefined && revision.bytePath !== relativeBytes) {
    throw new Error(`revision ${revision.revisionId} byte path mismatch`);
  }

  preserveByteArtifact(resolveCachePath(cacheDir, relativeBytes), originalBytes, byteHash);

  const extractPath = resolveCachePath(cacheDir, revision.extractPath);
  const extract = readValidatedJson(extractPath, 'revision extract');
  if (extract.revisionId !== revision.revisionId || extract.byteHash !== byteHash) {
    throw new Error(`revision ${revision.revisionId} extract identity mismatch`);
  }
  if (extract.bytePath !== undefined && extract.bytePath !== relativeBytes) {
    throw new Error(`revision ${revision.revisionId} extract byte path mismatch`);
  }
  if (extract.bytePath === undefined) {
    writeIdentityJson(extractPath, { ...extract, bytePath: relativeBytes });
  }
  revision.bytePath = relativeBytes;
}

function appendRevision({ cacheDir, sourcePath, originalBytes, parsed }) {
  if (!cacheDir) throw new Error('cacheDir is required');
  if (!Buffer.isBuffer(originalBytes) && !(originalBytes instanceof Uint8Array)) {
    throw new Error('originalBytes must be a Buffer or Uint8Array');
  }
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.objects)) {
    throw new Error('parsed.objects must be an array');
  }

  const resolvedSourcePath = path.resolve(String(sourcePath));
  const normalizedSourcePath = normalizeSourcePath(resolvedSourcePath);
  const sourceId = sourceIdForPath(resolvedSourcePath);
  const byteHash = sha256(originalBytes);
  const revisionId = `${sourceId}-${byteHash}`;
  const relativeExtract = extractRelativePath(sourceId, byteHash);
  const relativeBytes = byteRelativePath(sourceId, byteHash);
  const extractPath = path.join(path.resolve(cacheDir), relativeExtract);
  const index = readIndex(cacheDir);
  let source = index.sources.find((entry) => entry.sourceId === sourceId);

  if (!source) {
    source = {
      sourceId,
      sourcePath: resolvedSourcePath,
      normalizedSourcePath,
      activeRevisionId: null,
      revisions: [],
    };
    index.sources.push(source);
  }

  let revision = source.revisions.find((entry) => entry.revisionId === revisionId);
  if (!revision) {
    const createdAt = new Date().toISOString();
    revision = {
      revisionId,
      byteHash,
      bytePath: relativeBytes,
      extractPath: relativeExtract,
      createdAt,
    };
    preserveByteArtifact(resolveCachePath(cacheDir, relativeBytes), originalBytes, byteHash);
    writeIdentityJson(extractPath, {
      sourceId,
      sourcePath: resolvedSourcePath,
      normalizedSourcePath,
      revisionId,
      byteHash,
      bytePath: relativeBytes,
      createdAt,
      parsed,
    });
    source.revisions.push(revision);
  } else {
    backfillRevisionBytes(cacheDir, revision, originalBytes, byteHash, relativeBytes);
  }

  source.activeRevisionId = revisionId;
  writeIndex(cacheDir, index);
  return { sourceId, revisionId, byteHash, extractPath };
}

function findSource(index, sourceId) {
  const source = index.sources.find((entry) => entry.sourceId === sourceId);
  if (!source) throw new Error(`source identity ${sourceId} is not present in the revision index`);
  return source;
}

function findRevision(index, revisionId) {
  for (const source of index.sources) {
    const revision = source.revisions.find((entry) => entry.revisionId === revisionId);
    if (revision) return { source, revision };
  }
  throw new Error(`revision ${revisionId} is not present in the revision index`);
}

function readRevision(cacheDir, revisionId) {
  const index = readIndex(cacheDir);
  const { revision } = findRevision(index, revisionId);
  const extract = readValidatedJson(
    path.join(path.resolve(cacheDir), revision.extractPath),
    'revision extract',
  );
  if (extract.revisionId !== revisionId) throw new Error('revision extract identity mismatch');
  if (extract.bytePath !== revision.bytePath) throw new Error('revision extract byte path mismatch');
  return extract;
}

function readRevisionBytes(cacheDir, revisionId) {
  const index = readIndex(cacheDir);
  const { revision } = findRevision(index, revisionId);
  return validateByteArtifact(
    resolveCachePath(cacheDir, revision.bytePath),
    revision.byteHash,
  );
}

function setActiveRevision(cacheDir, sourceId, revisionId) {
  const index = readIndex(cacheDir);
  const source = findSource(index, sourceId);
  if (!source.revisions.some((entry) => entry.revisionId === revisionId)) {
    throw new Error(`revision ${revisionId} does not belong to source ${sourceId}`);
  }
  source.activeRevisionId = revisionId;
  writeIndex(cacheDir, index);
  return readRevision(cacheDir, revisionId);
}

function comparableHash(value) {
  if (typeof value.contentHash === 'string') return value.contentHash;
  return sha256(Buffer.from(String(value.content || ''), 'utf8'));
}

function compareRevisions(base, head) {
  if (base.sourceId !== head.sourceId) {
    throw new Error('base and head revisions must share the same source identity');
  }
  const baseObjects = new Map(base.parsed.objects.map((value) => [objectKey(value), value]));
  const headObjects = new Map(head.parsed.objects.map((value) => [objectKey(value), value]));
  const added = [];
  const modified = [];
  const removed = [];

  for (const [key, value] of headObjects) {
    if (!baseObjects.has(key)) added.push({ key, object: value });
    else if (comparableHash(baseObjects.get(key)) !== comparableHash(value)) {
      modified.push({ key, base: baseObjects.get(key), head: value });
    }
  }
  for (const [key, value] of baseObjects) {
    if (!headObjects.has(key)) removed.push({ key, object: value });
  }

  const byKey = (left, right) => left.key.localeCompare(right.key);
  return {
    sourceId: base.sourceId,
    baseRevisionId: base.revisionId,
    headRevisionId: head.revisionId,
    added: added.sort(byKey),
    modified: modified.sort(byKey),
    removed: removed.sort(byKey),
  };
}

function selectRevision(cacheDir, { sourceId, sourcePath, revisionId } = {}) {
  const index = readIndex(cacheDir);
  const selectedSourceId = sourceId || (sourcePath ? sourceIdForPath(sourcePath) : null);
  const source = selectedSourceId
    ? findSource(index, selectedSourceId)
    : index.sources.length === 1
      ? index.sources[0]
      : null;
  if (!source) throw new Error('source is required when the revision index contains multiple sources');
  const selectedRevisionId = revisionId || source.activeRevisionId;
  if (!selectedRevisionId) throw new Error(`source ${source.sourceId} has no active revision`);
  if (!source.revisions.some((entry) => entry.revisionId === selectedRevisionId)) {
    throw new Error(`revision ${selectedRevisionId} does not belong to source ${source.sourceId}`);
  }
  return { source, revision: readRevision(cacheDir, selectedRevisionId) };
}

module.exports = {
  appendRevision,
  compareRevisions,
  indexPath,
  normalizeSourcePath,
  objectKey,
  readIndex,
  readRevision,
  readRevisionBytes,
  selectRevision,
  setActiveRevision,
  sourceIdForPath,
};

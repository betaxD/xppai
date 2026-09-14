'use strict';

const fs = require('node:fs');
const path = require('node:path');

const VALID_STATUSES = new Set(['supported', 'gated', 'deferred']);
const REFERENCE_ID = /^(?:platform|business)\.[a-z0-9-]+$/;

function invalidReference(ref) {
  const id = ref && typeof ref.id === 'string' ? ref.id : '<unknown>';
  return new Error(`invalid reference contract: ${id}`);
}

function hasSafeRelativePath(value) {
  if (typeof value !== 'string' || value.length === 0 || path.isAbsolute(value) || path.win32.isAbsolute(value)) {
    return false;
  }
  const segments = value.replace(/\\/g, '/').split('/');
  return segments.every((segment) => segment !== '' && segment !== '.' && segment !== '..');
}

function validateReference(ref, absolutePath) {
  if (
    !ref
    || typeof ref !== 'object'
    || !REFERENCE_ID.test(ref.id)
    || !hasSafeRelativePath(ref.path)
    || ref.baseline !== '2012-R3'
    || !Array.isArray(ref.domains)
    || ref.domains.length === 0
    || ref.domains.some((domain) => typeof domain !== 'string' || domain.trim() === '')
    || !VALID_STATUSES.has(ref.status)
  ) {
    throw invalidReference(ref);
  }
  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    throw new Error(`missing reference: ${ref.id}`);
  }
  return ref;
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new Error(`missing reference manifest: ${file}`);
    }
    throw new Error(`invalid reference manifest: ${file}: ${error.message}`);
  }
}

function resolveAssetRoot(root) {
  const absolute = path.resolve(root);
  if (path.basename(absolute).toLowerCase() === 'assets') return absolute;
  return path.join(absolute, 'assets');
}

function loadReferenceManifest(root) {
  const assetRoot = resolveAssetRoot(root);
  const referencesRoot = path.join(assetRoot, 'references');
  const manifest = readJson(path.join(referencesRoot, 'manifest.json'));
  if (
    !manifest
    || manifest.schemaVersion !== 1
    || manifest.baseline !== '2012-R3'
    || !Array.isArray(manifest.references)
  ) {
    throw new Error('invalid reference manifest header');
  }

  const ids = new Set();
  for (const ref of manifest.references) {
    if (ref && ids.has(ref.id)) throw invalidReference(ref);
    const absolutePath = path.resolve(referencesRoot, ref && ref.path ? ref.path : '');
    validateReference(ref, absolutePath);
    ids.add(ref.id);
  }
  return manifest;
}

module.exports = {
  VALID_STATUSES,
  loadReferenceManifest,
  validateReference,
};

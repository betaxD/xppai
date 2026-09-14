'use strict';

const path = require('node:path');

const MANIFEST_NAME = '.xppai-ax2012-owned.json';
const SCHEMA_VERSION = 1;
const PACKAGE_NAME = 'xppai-ax2012';
const VALID_MODES = new Set(['copy', 'symlink']);

function validateOwnedPath(value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error('owned path must be a non-empty relative path');
  }
  const normalized = value.replace(/\\/g, '/');
  const segments = normalized.split('/');
  if (
    path.isAbsolute(value)
    || path.win32.isAbsolute(value)
    || segments.some((segment) => segment === '' || segment === '.' || segment === '..')
    || !segments[0].startsWith('xppai-ax2012-')
  ) {
    throw new Error(`owned path is outside the AX 2012 namespace: ${value}`);
  }
  return normalized;
}

function validateManifest(manifest) {
  if (
    !manifest
    || manifest.schemaVersion !== SCHEMA_VERSION
    || manifest.package !== PACKAGE_NAME
    || typeof manifest.version !== 'string'
    || !manifest.version
    || typeof manifest.target !== 'string'
    || !VALID_MODES.has(manifest.mode)
    || !manifest.destinations
    || typeof manifest.destinations !== 'object'
    || !Array.isArray(manifest.entries)
  ) {
    throw new Error('invalid AX 2012 ownership manifest header');
  }
  for (const entry of manifest.entries) {
    if (!entry || !Object.hasOwn(manifest.destinations, entry.destination)) {
      throw new Error('invalid manifest entry destination');
    }
    validateOwnedPath(entry.path);
    if (entry.kind === 'copy') {
      if (typeof entry.contentHash !== 'string' || !entry.contentHash) {
        throw new Error('invalid manifest entry: copy entries require contentHash');
      }
    } else if (entry.kind === 'symlink') {
      if (typeof entry.symlinkTarget !== 'string' || !entry.symlinkTarget) {
        throw new Error('invalid manifest entry: symlink entries require symlinkTarget');
      }
    } else {
      throw new Error(`invalid manifest entry kind: ${entry.kind}`);
    }
  }
  return manifest;
}

function createManifest({ version, target, mode, destinations, entries }) {
  const manifest = {
    schemaVersion: SCHEMA_VERSION,
    package: PACKAGE_NAME,
    version,
    target,
    mode,
    destinations: { ...destinations },
    entries: entries.map((entry) => ({ ...entry, path: validateOwnedPath(entry.path) })),
  };
  return validateManifest(manifest);
}

module.exports = {
  MANIFEST_NAME,
  createManifest,
  validateManifest,
  validateOwnedPath,
};

'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const { readValidatedJson, writeIdentityJson } = require('./identity');
const { sessionAuthPath } = require('./paths');

function normalizeCacheDir(cacheDir) {
  return path.resolve(cacheDir).replace(/\\/g, '/').toLowerCase();
}

function cacheFingerprint(cacheDir) {
  const bytes = fs.readFileSync(path.join(path.resolve(cacheDir), 'index.json'));
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function readSessionAuthorization(cacheDir) {
  return readValidatedJson(sessionAuthPath(cacheDir), 'session authorization');
}

function writeSessionAuthorization(cacheDir, payload) {
  return writeIdentityJson(sessionAuthPath(cacheDir), payload);
}

function requireSessionAuthorization(cacheDir) {
  let authorization;
  try {
    authorization = readSessionAuthorization(cacheDir);
  } catch (error) {
    if (error.code === 'ENOENT' || /cannot read session authorization JSON/i.test(error.message)) {
      throw new Error('snapshot authorization is required before querying the XPO cache');
    }
    throw error;
  }
  if (authorization.cacheDir !== normalizeCacheDir(cacheDir)) {
    throw new Error('snapshot authorization does not match this cache directory');
  }
  if (authorization.indexFingerprint !== cacheFingerprint(cacheDir)) {
    throw new Error('snapshot authorization is stale because the revision index changed');
  }
  return authorization;
}

module.exports = {
  cacheFingerprint,
  normalizeCacheDir,
  readSessionAuthorization,
  requireSessionAuthorization,
  writeSessionAuthorization,
};

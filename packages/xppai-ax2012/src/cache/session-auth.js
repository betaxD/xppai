'use strict';

const { readValidatedJson, writeIdentityJson } = require('./identity');
const { sessionAuthPath } = require('./paths');

function readSessionAuthorization(cacheDir) {
  return readValidatedJson(sessionAuthPath(cacheDir), 'session authorization');
}

function writeSessionAuthorization(cacheDir, payload) {
  return writeIdentityJson(sessionAuthPath(cacheDir), payload);
}

module.exports = { readSessionAuthorization, writeSessionAuthorization };

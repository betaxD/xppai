'use strict';

const path = require('node:path');

const { localAppDataDir, readConfig } = require('../config/user-config');

function defaultCacheDir(env = process.env) {
  return path.join(localAppDataDir(env), 'xppai-ax2012', 'cache', 'xpo');
}

function resolveCacheDir(flags = {}, env = process.env) {
  if (flags['--cache-dir']) {
    return { path: path.resolve(String(flags['--cache-dir'])), source: 'command-line' };
  }

  const config = readConfig(env);
  if (config.ax2012XpoCacheDir) {
    return { path: path.resolve(String(config.ax2012XpoCacheDir)), source: 'user-config' };
  }

  if (env.XPPAI_AX2012_CACHE_DIR) {
    return { path: path.resolve(String(env.XPPAI_AX2012_CACHE_DIR)), source: 'environment' };
  }

  return { path: defaultCacheDir(env), source: 'default' };
}

function sessionAuthPath(cacheDir) {
  return path.resolve(cacheDir, 'xpo-session-auth.json');
}

module.exports = { defaultCacheDir, resolveCacheDir, sessionAuthPath };

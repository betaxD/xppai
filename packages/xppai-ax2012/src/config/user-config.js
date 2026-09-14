'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

function localAppDataDir(env = process.env) {
  return env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
}

function configPath(env = process.env) {
  return path.join(localAppDataDir(env), 'xppai-ax2012', 'config.json');
}

function readConfig(env = process.env) {
  const file = configPath(env);
  if (!fs.existsSync(file)) return {};

  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`invalid xppai-ax2012 user config at ${file}: ${error.message}`);
  }
}

function writeConfig(config, env = process.env) {
  const file = configPath(env);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  return file;
}

module.exports = { configPath, localAppDataDir, readConfig, writeConfig };

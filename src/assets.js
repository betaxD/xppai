'use strict';

const nodePath = require('path');
const fs = require('fs');

function skillsDir() {
  return nodePath.join(__dirname, '..', 'assets', 'skills');
}

function commandsDir() {
  return nodePath.join(__dirname, '..', 'assets', 'commands');
}

function list() {
  const dir = skillsDir();
  return fs.readdirSync(dir)
    .filter(name => fs.statSync(nodePath.join(dir, name)).isDirectory())
    .sort();
}

function assetPath() {
  return skillsDir();
}

module.exports = { list, path: assetPath, commandsPath: commandsDir };

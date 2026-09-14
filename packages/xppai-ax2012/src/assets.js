'use strict';

const fs = require('node:fs');
const nodePath = require('node:path');

const { PUBLIC_SKILLS } = require('./constants');

function skillsDir() {
  return nodePath.join(__dirname, '..', 'assets', 'skills');
}

function assetRoot() {
  return nodePath.join(__dirname, '..', 'assets');
}

function commandsDir() {
  return nodePath.join(assetRoot(), 'commands');
}

function list() {
  const root = skillsDir();
  const actual = fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const expected = [...PUBLIC_SKILLS].sort();

  if (actual.length !== expected.length || actual.some((name, index) => name !== expected[index])) {
    throw new Error(
      `AX 2012 asset contract mismatch; expected ${expected.join(', ')}, found ${actual.join(', ')}`,
    );
  }

  return actual;
}

module.exports = { commandsPath: commandsDir, list, path: skillsDir, root: assetRoot };

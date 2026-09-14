'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

function compareOrdinal(left, right) {
  return Buffer.from(left, 'utf8').compare(Buffer.from(right, 'utf8'));
}

function listFiles(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(root, entry.name);
    return entry.isDirectory() ? listFiles(absolute) : [absolute];
  });
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function hashTree(repositoryRoot, relativeRoot) {
  const absoluteRoot = path.join(repositoryRoot, relativeRoot);
  const entries = listFiles(absoluteRoot).map((absolute) => {
    const relative = path.relative(repositoryRoot, absolute).replace(/\\/g, '/');
    return [relative, sha256(fs.readFileSync(absolute))];
  });

  entries.sort(([left], [right]) => compareOrdinal(left, right));
  return Object.fromEntries(entries);
}

function aggregateHash(entries) {
  const rows = Object.entries(entries)
    .sort(([left], [right]) => compareOrdinal(left, right))
    .map(([relative, hash]) => `${relative}\t${hash}\n`)
    .join('');

  return sha256(Buffer.from(rows, 'utf8'));
}

module.exports = { aggregateHash, compareOrdinal, hashTree, listFiles, sha256 };

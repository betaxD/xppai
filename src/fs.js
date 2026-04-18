'use strict';

const fs = require('fs');
const nodePath = require('path');
const os = require('os');

function expandHome(p) {
  if (typeof p === 'string' && p.startsWith('~')) {
    return nodePath.join(os.homedir(), p.slice(1));
  }
  return p;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copySkill(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src)) {
    const srcPath = nodePath.join(src, entry);
    const destPath = nodePath.join(dest, entry);
    if (fs.statSync(srcPath).isDirectory()) {
      copySkill(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function symlinkSkill(src, dest) {
  const type = process.platform === 'win32' ? 'junction' : 'dir';
  fs.symlinkSync(src, dest, type);
}

function removeOwned(dir, entries) {
  for (const entry of entries) {
    const entryPath = nodePath.join(dir, entry);
    if (!fs.existsSync(entryPath)) continue;
    fs.rmSync(entryPath, { recursive: true, force: true });
  }
}

module.exports = { expandHome, ensureDir, copySkill, symlinkSkill, removeOwned };

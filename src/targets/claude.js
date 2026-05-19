'use strict';

const os = require('os');
const nodePath = require('path');
const fs = require('fs');
const fsHelpers = require('../fs');
const generic = require('./generic');
const assets = require('../assets');

module.exports = {
  id: 'claude',

  resolveInstallDir(_opts) {
    return nodePath.join(os.homedir(), '.claude', 'skills');
  },

  listOwnedEntries(skillsDir) {
    return generic.listOwnedEntries(skillsDir);
  },

  export(skillsDir, outDir, opts = {}) {
    generic.export(skillsDir, outDir, opts);
    this._exportCommands(opts);
  },

  _exportCommands(opts = {}) {
    const srcDir = assets.commandsPath();
    const destDir = nodePath.join(os.homedir(), '.claude', 'commands');
    const mode = (opts && opts.mode) || 'copy';

    fsHelpers.ensureDir(destDir);

    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.md'));
    const owned = files.map(f => f);
    fsHelpers.removeOwned(destDir, owned);

    for (const file of files) {
      const src = nodePath.join(srcDir, file);
      const dest = nodePath.join(destDir, file);
      if (mode === 'symlink') {
        fsHelpers.symlinkSkill(src, dest);
      } else {
        fs.copyFileSync(src, dest);
      }
    }
  },
};

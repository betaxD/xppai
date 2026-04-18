'use strict';

const nodePath = require('path');
const fs = require('fs');
const fsHelpers = require('../fs');

module.exports = {
  id: 'generic',

  resolveInstallDir(_opts) {
    return null;
  },

  listOwnedEntries(skillsDir) {
    return fs.readdirSync(skillsDir)
      .filter(name => fs.statSync(nodePath.join(skillsDir, name)).isDirectory())
      .sort();
  },

  export(skillsDir, outDir, opts = {}) {
    const mode = (opts && opts.mode) || 'copy';
    const owned = this.listOwnedEntries(skillsDir);
    fsHelpers.ensureDir(outDir);
    fsHelpers.removeOwned(outDir, owned);
    for (const name of owned) {
      const src = nodePath.join(skillsDir, name);
      const dest = nodePath.join(outDir, name);
      if (mode === 'symlink') {
        fsHelpers.symlinkSkill(src, dest);
      } else {
        fsHelpers.copySkill(src, dest);
      }
    }
  },
};

'use strict';

const os = require('os');
const nodePath = require('path');
const generic = require('./generic');

module.exports = {
  id: 'codex',

  resolveInstallDir(_opts) {
    return nodePath.join(os.homedir(), '.agents', 'skills');
  },

  listOwnedEntries(skillsDir) {
    return generic.listOwnedEntries(skillsDir);
  },

  export(skillsDir, outDir, opts = {}) {
    return generic.export(skillsDir, outDir, opts);
  },
};

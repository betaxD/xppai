'use strict';

const os = require('os');
const nodePath = require('path');
const generic = require('./generic');

module.exports = {
  id: 'qwen',

  resolveInstallDir(_opts) {
    return nodePath.join(os.homedir(), '.qwen', 'skills');
  },

  listOwnedEntries(skillsDir) {
    return generic.listOwnedEntries(skillsDir);
  },

  export(skillsDir, outDir, opts = {}) {
    return generic.export(skillsDir, outDir, opts);
  },
};

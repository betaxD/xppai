'use strict';

const path = require('node:path');

module.exports = {
  id: 'copilot',
  resolveInstallDestinations(options = {}) {
    const cwd = path.resolve(options.cwd || process.cwd());
    return { skills: path.join(cwd, '.github', 'skills') };
  },
  resolveExportDestinations(outDir) {
    return { skills: path.join(path.resolve(String(outDir)), '.github', 'skills') };
  },
};

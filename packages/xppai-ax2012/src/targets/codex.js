'use strict';

const os = require('node:os');
const path = require('node:path');

module.exports = {
  id: 'codex',
  resolveInstallDestinations(options = {}) {
    const home = path.resolve(options.homeDir || os.homedir());
    return { skills: path.join(home, '.codex', 'skills') };
  },
  resolveExportDestinations(outDir) {
    return { skills: path.join(path.resolve(String(outDir)), 'skills') };
  },
};

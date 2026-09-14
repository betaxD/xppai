'use strict';

const os = require('node:os');
const path = require('node:path');

module.exports = {
  id: 'qwen',
  resolveInstallDestinations(options = {}) {
    const home = path.resolve(options.homeDir || os.homedir());
    return { skills: path.join(home, '.qwen', 'skills') };
  },
  resolveExportDestinations(outDir) {
    return { skills: path.join(path.resolve(String(outDir)), 'skills') };
  },
};

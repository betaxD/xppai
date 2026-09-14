'use strict';

const os = require('node:os');
const path = require('node:path');

module.exports = {
  id: 'claude',
  resolveInstallDestinations(options = {}) {
    const home = path.resolve(options.homeDir || os.homedir());
    return {
      skills: path.join(home, '.claude', 'skills'),
      commands: path.join(home, '.claude', 'commands'),
    };
  },
  resolveExportDestinations(outDir) {
    const root = path.resolve(String(outDir));
    return { skills: path.join(root, 'skills'), commands: path.join(root, 'commands') };
  },
};

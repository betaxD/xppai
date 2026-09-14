'use strict';

const path = require('node:path');

module.exports = {
  id: 'generic',
  resolveInstallDestinations() {
    return null;
  },
  resolveExportDestinations(outDir) {
    const root = path.resolve(String(outDir));
    return { skills: path.join(root, 'skills'), commands: path.join(root, 'commands') };
  },
};

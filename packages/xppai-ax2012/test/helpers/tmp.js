'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

function useTempDir(t, prefix = 'xppai-ax2012-') {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(directory, { force: true, recursive: true }));
  return directory;
}

module.exports = { useTempDir };

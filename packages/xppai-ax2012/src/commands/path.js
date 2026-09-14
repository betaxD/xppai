'use strict';

const assets = require('../assets');

function showPath() {
  process.stdout.write(`${assets.path()}\n`);
}

module.exports = showPath;

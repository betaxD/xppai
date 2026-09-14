'use strict';

const assets = require('../assets');

function list() {
  process.stdout.write(`${assets.list().join('\n')}\n`);
}

module.exports = list;

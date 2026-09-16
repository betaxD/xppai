'use strict';

const UTF8_BOM = Buffer.from([0xef, 0xbb, 0xbf]);

function encodeImportableXpo(value) {
  if (typeof value !== 'string') throw new Error('XPO output must be provided as text');

  const normalized = value
    .replace(/^\ufeff/, '')
    .replace(/\r\n|\r|\n/g, '\n')
    .replace(/\n+$/, '');
  const body = normalized ? `${normalized.replace(/\n/g, '\r\n')}\r\n` : '';

  return Buffer.concat([UTF8_BOM, Buffer.from(body, 'utf8')]);
}

module.exports = { encodeImportableXpo };

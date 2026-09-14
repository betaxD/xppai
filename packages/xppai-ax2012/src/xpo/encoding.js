'use strict';

const { TextDecoder } = require('node:util');

function unsupported(error) {
  const detail = error ? `: ${error.message}` : '';
  return new Error(
    `unsupported or binary XPO encoding${detail}; provide UTF-8 or BOM-marked UTF-16LE evidence`,
  );
}

function decodeSource(value) {
  if (!Buffer.isBuffer(value) && !(value instanceof Uint8Array)) {
    throw new Error('XPO source must be provided as bytes');
  }
  const bytes = Buffer.from(value);
  let encoding;
  let bomBytes;
  let text;

  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    if ((bytes.length - 2) % 2 !== 0) throw unsupported(new Error('odd UTF-16LE byte count'));
    encoding = 'utf16le';
    bomBytes = 2;
    text = bytes.subarray(2).toString('utf16le');
  } else {
    if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) throw unsupported();
    encoding = 'utf8';
    bomBytes = bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf ? 3 : 0;
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(bomBytes));
    } catch (error) {
      throw unsupported(error);
    }
    if (text.includes('\u0000')) throw unsupported();
  }

  function byteOffsetAt(characterOffset) {
    if (!Number.isInteger(characterOffset) || characterOffset < 0 || characterOffset > text.length) {
      throw new Error(`character offset is outside decoded source: ${characterOffset}`);
    }
    return bomBytes + Buffer.byteLength(text.slice(0, characterOffset), encoding);
  }

  return { bytes, text, encoding, bomBytes, byteOffsetAt };
}

module.exports = { decodeSource };

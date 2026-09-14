'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { decodeSource } = require('../../src/xpo/encoding');

const FIXTURES = path.join(__dirname, '..', 'fixtures', 'xpo');

test('decodeSource accepts UTF-8 with and without BOM and preserves byte offsets', () => {
  const text = fs.readFileSync(path.join(FIXTURES, 'utf8-bom.xpo'), 'utf8');
  const plain = decodeSource(Buffer.from(text, 'utf8'));
  const withBom = decodeSource(Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(text, 'utf8')]));

  assert.equal(plain.encoding, 'utf8');
  assert.equal(plain.bomBytes, 0);
  assert.equal(withBom.encoding, 'utf8');
  assert.equal(withBom.bomBytes, 3);
  assert.equal(withBom.text, plain.text);
  assert.equal(withBom.byteOffsetAt(0), 3);
  assert.equal(withBom.byteOffsetAt(withBom.text.length), withBom.bytes.length);
});

test('decodeSource accepts UTF-16LE BOM and maps characters to original bytes', () => {
  const text = fs.readFileSync(path.join(FIXTURES, 'utf16le.xpo'), 'utf8');
  const bytes = Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(text, 'utf16le')]);
  const decoded = decodeSource(bytes);

  assert.equal(decoded.encoding, 'utf16le');
  assert.equal(decoded.text, text);
  assert.equal(decoded.byteOffsetAt(0), 2);
  assert.equal(decoded.byteOffsetAt(text.length), bytes.length);
});

test('decodeSource rejects unsupported binary evidence with a corrective diagnostic', () => {
  assert.throws(
    () => decodeSource(Buffer.from([0x00, 0xff, 0x00, 0x10])),
    /unsupported or binary XPO encoding.*UTF-8.*UTF-16LE/i,
  );
});

'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { parseXpo } = require('../../src/xpo/parser');

const FIXTURES = path.join(__dirname, '..', 'fixtures', 'xpo');

function fixture(name) {
  return fs.readFileSync(path.join(FIXTURES, name));
}

test('nested SOURCE remains inside its owning object and records structural uncertainty', () => {
  const bytes = fixture('class-table-form-query.xpo');
  const parsed = parseXpo(bytes, { sourcePath: 'synthetic/class-table-form-query.xpo' });

  assert.deepEqual(parsed.objects.map((value) => `${value.canonicalType}:${value.name}`), [
    'Class:DemoController',
    'Table:DemoTable',
    'Form:DemoForm',
    'Query:DemoQuery',
  ]);
  assert.match(parsed.objects[0].content, /SOURCE #run/);
  assert.equal(parsed.fragments.some((value) => value.rawType === 'SOURCE'), false);
  assert.equal(parsed.completeness, 'indeterminate');
  assert.match(parsed.warnings[0].reason, /nested header/i);

  const first = parsed.objects[0];
  assert.equal(first.offsets.line.start, 1);
  assert.equal(
    first.contentHash,
    crypto.createHash('sha256').update(bytes.subarray(first.offsets.byte.start, first.offsets.byte.end)).digest('hex'),
  );
  assert.equal(first.provenance.parser, 'xppai-ax2012-registry-v1');
});

test('service and security objects use canonical registry types', () => {
  const parsed = parseXpo(fixture('service-security.xpo'));
  assert.deepEqual(parsed.objects.map((value) => value.canonicalType), [
    'Service',
    'ServiceGroup',
    'SecurityRole',
    'SecurityDuty',
    'SecurityPrivilege',
    'SecurityPolicy',
  ]);
  assert.equal(parsed.completeness, 'complete');
});

test('an unknown top-level token is preserved as indeterminate', () => {
  const parsed = parseXpo(fixture('unknown.xpo'));
  assert.equal(parsed.objects.length, 0);
  assert.equal(parsed.fragments[0].rawType, 'FUTUREOBJECT');
  assert.match(parsed.fragments[0].content, /SYNTHETICPAYLOAD\r?\nENDFUTUREOBJECT/);
  assert.equal(parsed.fragments[0].completeness, 'indeterminate');
  assert.equal(parsed.completeness, 'indeterminate');
});

test('a provably missing required closer makes the object and file incomplete', () => {
  const parsed = parseXpo(fixture('incomplete.xpo'));
  assert.equal(parsed.objects.length, 1);
  assert.equal(parsed.objects[0].completeness, 'incomplete');
  assert.match(parsed.objects[0].reason, /missing ENDCLASS/i);
  assert.equal(parsed.completeness, 'incomplete');
});

test('baseline evidence stays split and strong foreign signals become conflicts', () => {
  const unknown = parseXpo(Buffer.from('CLASS #Demo\nENDCLASS\n'));
  assert.equal(unknown.baseline.expected.value, '2012-R3');
  assert.equal(unknown.baseline.declared.value, 'Unknown');
  assert.equal(unknown.baseline.inferred.value, 'Unknown');

  const conflict = parseXpo(
    Buffer.from('[ExtensionOf(classStr(Demo))]\nCLASS #Demo_Extension\nENDCLASS\n'),
    { declaredBaseline: 'D365 Finance and Operations' },
  );
  assert.equal(conflict.baseline.conflicts.some((value) => value.strength === 'strong'), true);

  const nonR3 = parseXpo(Buffer.from('; Microsoft Dynamics AX 2012 R2\nCLASS #Demo\nENDCLASS\n'));
  assert.equal(
    nonR3.baseline.conflicts.some((value) => /non-R3 version metadata/i.test(value.evidence)),
    true,
  );
});

test('unrecognized text is preserved as one indeterminate whole-input fragment', () => {
  const bytes = Buffer.from('arbitrary text\r\nwith no XPO token', 'utf8');
  const parsed = parseXpo(bytes);

  assert.equal(parsed.objects.length, 0);
  assert.equal(parsed.fragments.length, 1);
  assert.equal(parsed.fragments[0].content, bytes.toString('utf8'));
  assert.deepEqual(parsed.fragments[0].offsets.byte, { start: 0, end: bytes.length });
  assert.equal(parsed.fragments[0].completeness, 'indeterminate');
  assert.match(parsed.fragments[0].reason, /no recognized top-level token/i);
  assert.equal(parsed.completeness, 'indeterminate');
});

test('indented tokens remain indeterminate instead of becoming top-level objects', () => {
  const bytes = Buffer.from('  CLASS #Indented\r\n  ENDCLASS\r\n', 'utf8');
  const parsed = parseXpo(bytes);

  assert.equal(parsed.objects.length, 0);
  assert.equal(parsed.fragments.length, 1);
  assert.equal(parsed.fragments[0].content, bytes.toString('utf8'));
  assert.equal(parsed.completeness, 'indeterminate');
});

test('unclassified bytes around recognized objects are preserved as fragments', () => {
  const source = [
    'prefix noise\n',
    'CLASS #First\n',
    'ENDCLASS\n',
    'between noise\n',
    'TABLE #Second\n',
    'ENDTABLE\n',
    'suffix noise\n',
  ].join('');
  const parsed = parseXpo(Buffer.from(source, 'utf8'));

  assert.deepEqual(parsed.objects.map((value) => `${value.canonicalType}:${value.name}`), [
    'Class:First',
    'Table:Second',
  ]);
  assert.deepEqual(parsed.fragments.map((value) => value.content), [
    'prefix noise\n',
    'between noise\n',
    'suffix noise\n',
  ]);
  assert.equal(parsed.completeness, 'indeterminate');
});

test('recognized objects expose the approved rawHeader field', () => {
  const parsed = parseXpo(Buffer.from('CLASS #Demo\nENDCLASS\n', 'utf8'));

  assert.equal(parsed.objects[0].rawHeader, 'Demo');
});

test('empty input remains explicit indeterminate evidence', () => {
  const parsed = parseXpo(Buffer.alloc(0));

  assert.equal(parsed.objects.length, 0);
  assert.equal(parsed.fragments.length, 1);
  assert.equal(parsed.fragments[0].content, '');
  assert.deepEqual(parsed.fragments[0].offsets.byte, { start: 0, end: 0 });
  assert.equal(parsed.fragments[0].contentHash, crypto.createHash('sha256').update(Buffer.alloc(0)).digest('hex'));
  assert.equal(parsed.completeness, 'indeterminate');
});

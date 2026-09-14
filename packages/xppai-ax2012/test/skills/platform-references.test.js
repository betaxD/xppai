'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const { loadReferenceManifest } = require('../../src/skills/manifest');

const PACKAGE_ROOT = path.resolve(__dirname, '../..');
const REFERENCES_ROOT = path.join(PACKAGE_ROOT, 'assets', 'references');
const PLATFORM_IDS = [
  'platform.model-store',
  'platform.xpp-language',
  'platform.sysoperation',
  'platform.aif',
  'platform.security',
  'platform.data-frameworks',
];

function referenceById(manifest, id) {
  const ref = manifest.references.find((candidate) => candidate.id === id);
  assert(ref, `missing manifest reference: ${id}`);
  return ref;
}

function readReference(ref) {
  return fs.readFileSync(path.join(REFERENCES_ROOT, ref.path), 'utf8');
}

test('platform references define AX 2012 evidence gates', () => {
  const manifest = loadReferenceManifest(PACKAGE_ROOT);

  for (const id of PLATFORM_IDS) {
    const ref = referenceById(manifest, id);
    const text = readReference(ref);
    assert.equal(ref.baseline, '2012-R3');
    assert.equal(ref.status, 'supported');
    assert(ref.domains.length > 0, `${id} has no routing domains`);
    assert.match(text, /Evidence required/i);
    assert.doesNotMatch(
      text,
      /^\s*(?:[-*]\s*)?(?:Use|Implement|Create|Prefer|Add|Extend)\b.*\b(?:Chain of Command|extension class)\b/im,
    );
  }
});

test('model-store, language, and SysOperation references cover their production boundaries', () => {
  const manifest = loadReferenceManifest(PACKAGE_ROOT);
  const modelStore = readReference(referenceById(manifest, 'platform.model-store'));
  const language = readReference(referenceById(manifest, 'platform.xpp-language'));
  const sysoperation = readReference(referenceById(manifest, 'platform.sysoperation'));

  for (const pattern of [/model store/i, /layer/i, /\.axmodel\b/i, /\.axmodelstore\b/i, /XPO alone/i, /full CIL/i]) {
    assert.match(modelStore, pattern);
  }
  for (const pattern of [/pre\/post event handlers/i, /XppPrePostArgs/i, /\bis\b[\s\S]*\bas\b/i, /CLR interop/i, /partition/i, /company/i]) {
    assert.match(language, pattern);
  }
  for (const pattern of [/DataContractAttribute/i, /DataMemberAttribute/i, /SysEntryPointAttribute/i, /UI builder/i, /Action menu item/i, /batch/i]) {
    assert.match(sysoperation, pattern);
  }
});

test('AIF, security, and data-framework references define safe operational gates', () => {
  const manifest = loadReferenceManifest(PACKAGE_ROOT);
  const aif = readReference(referenceById(manifest, 'platform.aif'));
  const security = readReference(referenceById(manifest, 'platform.security'));
  const data = readReference(referenceById(manifest, 'platform.data-frameworks'));

  for (const pattern of [/document service/i, /custom service/i, /integration port/i, /WCF/i, /company/i, /partition/i, /service refresh/i]) {
    assert.match(aif, pattern);
  }
  for (const pattern of [/roles/i, /duties/i, /privileges/i, /XDS/i, /Code Access Security/i, /non-admin/i]) {
    assert.match(security, pattern);
  }
  for (const pattern of [/valid-time-state/i, /table inheritance/i, /TempDB/i, /UnitOfWork/i, /delete actions/i, /RecId/i, /number sequence/i, /rollback/i]) {
    assert.match(data, pattern);
  }
});

module.exports = { PLATFORM_IDS, readReference, referenceById };

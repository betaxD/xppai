'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const { loadReferenceManifest } = require('../../src/skills/manifest');

const PACKAGE_ROOT = path.resolve(__dirname, '../..');
const REFERENCES_ROOT = path.join(PACKAGE_ROOT, 'assets', 'references');
const EXPECTED = new Map([
  ['business.financial-dimensions', 'supported'],
  ['business.ledger-posting', 'gated'],
  ['business.inventory-trade', 'supported'],
  ['business.retail', 'gated'],
  ['business.workflow-ssrs', 'deferred'],
  ['business.regionalization', 'gated'],
]);

function referenceById(manifest, id) {
  const ref = manifest.references.find((candidate) => candidate.id === id);
  assert(ref, `missing manifest reference: ${id}`);
  return ref;
}

function readReference(ref) {
  return fs.readFileSync(path.join(REFERENCES_ROOT, ref.path), 'utf8');
}

test('business references separate supported, gated, and deferred domains', () => {
  const manifest = loadReferenceManifest(PACKAGE_ROOT);

  for (const [id, status] of EXPECTED) {
    const ref = referenceById(manifest, id);
    assert.equal(ref.baseline, '2012-R3');
    assert.equal(ref.status, status);
    assert(ref.domains.length > 0, `${id} has no routing domains`);
    assert.match(readReference(ref), /Evidence required/i);
  }
  assert.match(
    readReference(referenceById(manifest, 'business.regionalization')),
    /country\/region code/i,
  );
});

test('financial, ledger, and inventory references preserve framework ownership', () => {
  const manifest = loadReferenceManifest(PACKAGE_ROOT);
  const financial = readReference(referenceById(manifest, 'business.financial-dimensions'));
  const ledger = readReference(referenceById(manifest, 'business.ledger-posting'));
  const inventory = readReference(referenceById(manifest, 'business.inventory-trade'));

  for (const pattern of [/DefaultDimension/, /LedgerDimension/, /account structure/i, /framework APIs/i, /direct writes/i]) {
    assert.match(financial, pattern);
  }
  for (const pattern of [/FormLetter/, /source-document accounting/i, /posting profile/i, /transaction/i, /direct insert\/update\/delete/i]) {
    assert.match(ledger, pattern);
  }
  for (const pattern of [/InventDim/, /InventTrans/, /reservations/i, /sales/i, /purchase/i, /costing/i]) {
    assert.match(inventory, pattern);
  }
});

test('gated and deferred references state their safe stopping behavior', () => {
  const manifest = loadReferenceManifest(PACKAGE_ROOT);
  const retail = readReference(referenceById(manifest, 'business.retail'));
  const workflow = readReference(referenceById(manifest, 'business.workflow-ssrs'));
  const regional = readReference(referenceById(manifest, 'business.regionalization'));

  for (const pattern of [/installed Retail components/i, /channel/i, /store/i, /preliminary guidance/i]) {
    assert.match(retail, pattern);
  }
  for (const pattern of [/deferred/i, /preliminary explanation/i, /architecture inventory/i, /gap report/i, /must not produce production-ready/i]) {
    assert.match(workflow, pattern);
  }
  for (const pattern of [/country\/region code/i, /model/i, /layer/i, /configuration key/i, /metadata/i, /code guard/i]) {
    assert.match(regional, pattern);
  }
});

test('the initial manifest contains twelve unique reference packs', () => {
  const manifest = loadReferenceManifest(PACKAGE_ROOT);
  const ids = manifest.references.map((ref) => ref.id);

  assert.equal(ids.length, 12);
  assert.equal(new Set(ids).size, 12);
});

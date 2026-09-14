'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const packageVersion = require('../../package.json').version;

const SCHEMA_VERSION = 1;
const PRODUCT = 'Microsoft Dynamics AX';
const BASELINE = '2012-R3';
const PRODUCER_PACKAGE = 'xppai-ax2012';

function identityEnvelope(version) {
  return {
    schemaVersion: SCHEMA_VERSION,
    product: PRODUCT,
    baseline: BASELINE,
    producer: { package: PRODUCER_PACKAGE, version },
  };
}

function assertIdentity(value, kind) {
  if (!value || typeof value !== 'object' || value.schemaVersion === undefined) {
    throw new Error(`${kind} cache identity is missing schemaVersion 1`);
  }
  if (value.schemaVersion < SCHEMA_VERSION) {
    throw new Error(`${kind} uses unsupported older schema ${value.schemaVersion}; explicit migration is required`);
  }
  if (value.schemaVersion > SCHEMA_VERSION) {
    throw new Error(`${kind} uses unsupported newer schema ${value.schemaVersion}; upgrade xppai-ax2012`);
  }
  if (
    value.product !== PRODUCT
    || value.baseline !== BASELINE
    || value.producer?.package !== PRODUCER_PACKAGE
    || typeof value.producer?.version !== 'string'
    || value.producer.version.length === 0
  ) {
    throw new Error(
      `${kind} cache identity mismatch; expected xppai-ax2012/${BASELINE} schema ${SCHEMA_VERSION}`,
    );
  }
  return value;
}

function readValidatedJson(file, kind) {
  let value;
  try {
    value = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`cannot read ${kind} JSON at ${file}: ${error.message}`);
  }
  return assertIdentity(value, kind);
}

function writeIdentityJson(file, payload, version = packageVersion) {
  const record = { ...payload, ...identityEnvelope(version) };
  const directory = path.dirname(file);
  const temporary = path.join(
    directory,
    `.${path.basename(file)}.${process.pid}.${crypto.randomBytes(6).toString('hex')}.tmp`,
  );
  let descriptor;

  fs.mkdirSync(directory, { recursive: true });
  try {
    descriptor = fs.openSync(temporary, 'wx', 0o600);
    fs.writeFileSync(descriptor, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = undefined;
    fs.renameSync(temporary, file);
  } catch (error) {
    if (descriptor !== undefined) fs.closeSync(descriptor);
    fs.rmSync(temporary, { force: true });
    throw error;
  }

  return record;
}

module.exports = { assertIdentity, identityEnvelope, readValidatedJson, writeIdentityJson };

'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { REGISTRY_V1, resolveRegistryEntry } = require('../../src/xpo/registry-v1');

test('registry v1 declares immutable AX 2012 structural boundaries for every supported type', () => {
  const expected = {
    CLASS: ['Class', 'ENDCLASS'],
    TABLE: ['Table', 'ENDTABLE'],
    FORM: ['Form', 'ENDFORM'],
    QUERY: ['Query', 'ENDQUERY'],
    VIEW: ['View', 'ENDVIEW'],
    MAP: ['Map', 'ENDMAP'],
    ENUM: ['Enum', 'ENDENUM'],
    EDT: ['ExtendedDataType', 'ENDEDT'],
    JOB: ['Job', 'ENDJOB'],
    PROJECT: ['Project', 'ENDPROJECT'],
    SERVICE: ['Service', 'ENDSERVICE'],
    SERVICEGROUP: ['ServiceGroup', 'ENDSERVICEGROUP'],
    SECURITYROLE: ['SecurityRole', 'ENDSECURITYROLE'],
    SECURITYDUTY: ['SecurityDuty', 'ENDSECURITYDUTY'],
    SECURITYPRIVILEGE: ['SecurityPrivilege', 'ENDSECURITYPRIVILEGE'],
    SECURITYPOLICY: ['SecurityPolicy', 'ENDSECURITYPOLICY'],
  };

  assert.equal(Object.isFrozen(REGISTRY_V1), true);
  for (const [token, [canonicalType, closer]] of Object.entries(expected)) {
    const entry = resolveRegistryEntry(token);
    assert.equal(entry.version, 1);
    assert.equal(entry.canonicalType, canonicalType);
    assert.equal(entry.closer, closer);
    assert.equal(entry.completenessRule, 'required-closer');
    assert.equal(entry.boundaryRule, 'column-zero-between-objects');
    assert.deepEqual(entry.nestedHeaders, ['SOURCE']);
  }
  for (const alias of ['EDT', 'EDTEXT', 'DATATYPE']) {
    assert.equal(resolveRegistryEntry(alias).canonicalType, 'ExtendedDataType');
  }
});

test('unknown tokens are not silently coerced to known object types', () => {
  assert.equal(resolveRegistryEntry('FUTUREOBJECT'), null);
});

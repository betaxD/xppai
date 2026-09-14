'use strict';

function entry(rawType, canonicalType, closer, aliases = []) {
  return Object.freeze({
    version: 1,
    rawType,
    canonicalType,
    aliases: Object.freeze([rawType, ...aliases]),
    closer,
    completenessRule: 'required-closer',
    boundaryRule: 'column-zero-between-objects',
    nestedHeaders: Object.freeze(['SOURCE']),
  });
}

const REGISTRY_V1 = Object.freeze([
  entry('CLASS', 'Class', 'ENDCLASS'),
  entry('TABLE', 'Table', 'ENDTABLE'),
  entry('FORM', 'Form', 'ENDFORM'),
  entry('QUERY', 'Query', 'ENDQUERY'),
  entry('VIEW', 'View', 'ENDVIEW'),
  entry('MAP', 'Map', 'ENDMAP'),
  entry('ENUM', 'Enum', 'ENDENUM'),
  entry('EDT', 'ExtendedDataType', 'ENDEDT', ['EDTEXT', 'DATATYPE']),
  entry('JOB', 'Job', 'ENDJOB'),
  entry('PROJECT', 'Project', 'ENDPROJECT'),
  entry('SERVICE', 'Service', 'ENDSERVICE'),
  entry('SERVICEGROUP', 'ServiceGroup', 'ENDSERVICEGROUP'),
  entry('SECURITYROLE', 'SecurityRole', 'ENDSECURITYROLE'),
  entry('SECURITYDUTY', 'SecurityDuty', 'ENDSECURITYDUTY'),
  entry('SECURITYPRIVILEGE', 'SecurityPrivilege', 'ENDSECURITYPRIVILEGE'),
  entry('SECURITYPOLICY', 'SecurityPolicy', 'ENDSECURITYPOLICY'),
]);

const BY_TOKEN = new Map();
for (const value of REGISTRY_V1) {
  for (const alias of value.aliases) BY_TOKEN.set(alias, value);
}

function resolveRegistryEntry(token) {
  return BY_TOKEN.get(String(token).toUpperCase()) || null;
}

module.exports = { REGISTRY_V1, resolveRegistryEntry };

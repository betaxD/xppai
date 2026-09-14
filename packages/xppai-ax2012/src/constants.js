'use strict';

const PRODUCT_IDENTITY = Object.freeze({
  package: 'xppai-ax2012',
  cli: 'xppai-ax2012',
  product: 'Microsoft Dynamics AX',
  baseline: '2012-R3',
});

const CACHE_IDENTITY = Object.freeze({
  schemaVersion: 1,
  ...PRODUCT_IDENTITY,
});

const PUBLIC_SKILLS = Object.freeze([
  'xppai-ax2012-core',
  'xppai-ax2012-intake',
  'xppai-ax2012-papai',
  'xppai-ax2012-explain',
  'xppai-ax2012-architect',
  'xppai-ax2012-risk',
  'xppai-ax2012-codefix',
  'xppai-ax2012-dev',
  'xppai-ax2012-help',
]);

module.exports = { PRODUCT_IDENTITY, CACHE_IDENTITY, PUBLIC_SKILLS };

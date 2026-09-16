'use strict';

const fs = require('fs');
const path = require('path');
const { encodeImportableXpo } = require('../../../packages/xppai-ax2012/src/xpo/writer');

const sourceDir = __dirname;
const outputPath = path.join(sourceDir, 'XppAiVendPayment.xpo');
const classFiles = [
  'XppAiVendPaymentContract.xpp',
  'XppAiVendPaymentResultContract.xpp',
  'XppAiVendPaymentService.xpp',
  'XppAiVendPaymentAifService.xpp',
  'XppAiVendPaymentController.xpp',
];

function topLevelBlocks(source) {
  const lines = source.replace(/\r\n/g, '\n').trim().split('\n');
  const blocks = [];
  let block = [];
  let depth = 0;
  let opened = false;

  for (const line of lines) {
    if (!block.length && !line.trim()) continue;
    block.push(line);

    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;
    if (opens) opened = true;
    depth += opens - closes;

    if (opened && depth === 0) {
      blocks.push(block.join('\n').trim());
      block = [];
      opened = false;
    }
  }

  if (block.some((line) => line.trim())) {
    throw new Error('Incomplete top-level X++ block.');
  }

  return blocks;
}

function methodName(block) {
  const signature = block
    .split('\n')
    .filter((line) => !/^\s*\[/.test(line))
    .join(' ');
  const match = signature.match(
    /\b(?:public|private|protected)\s+(?:(?:static|final|server|client)\s+)*(?:[A-Za-z_][A-Za-z0-9_:<>]*)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/
  );

  if (!match) throw new Error(`Unable to identify method name:\n${block}`);
  return match[1];
}

function sourceBlock(name, source) {
  const body = source
    .split('\n')
    .map((line) => `        #${line}`)
    .join('\r\n');
  return `      SOURCE #${name}\r\n${body}\r\n      ENDSOURCE`;
}

function classElement(inputDir, fileName) {
  const source = fs.readFileSync(path.join(inputDir, fileName), 'utf8');
  const blocks = topLevelBlocks(source);
  const declaration = blocks.shift();
  const classMatch = declaration.match(/\bclass\s+([A-Za-z_][A-Za-z0-9_]*)/);
  const extendsMatch = declaration.match(/\bextends\s+([A-Za-z_][A-Za-z0-9_]*)/);

  if (!classMatch) throw new Error(`Class declaration not found in ${fileName}.`);

  const className = classMatch[1];
  const properties = [
    `      Name                #${className}`,
    `      Extends             #${extendsMatch ? extendsMatch[1] : ''}`,
    `      RunOn               #${className.endsWith('Service') ? 'Server' : 'Called from'}`,
  ].join('\r\n');
  const methods = [
    sourceBlock('classDeclaration', declaration),
    ...blocks.map((block) => sourceBlock(methodName(block), block)),
  ].join('\r\n');

  return [
    '***Element: CLS',
    '',
    `; Microsoft Dynamics AX Class: ${className} unloaded`,
    '; --------------------------------------------------------------------------------',
    '  CLSVERSION 1',
    '',
    `  CLASS #${className}`,
    '    PROPERTIES',
    properties,
    '    ENDPROPERTIES',
    '',
    '    METHODS',
    '      Version: 3',
    methods,
    '    ENDMETHODS',
    '  ENDCLASS',
    '',
  ].join('\r\n');
}

function buildXpo(options) {
  const inputDir = options.sourceDir;
  const targetPath = options.outputPath;
  const files = options.classFiles;
  const xpo = [
    'Exportfile for AOT version 1.0 or later',
    'Formatversion: 1',
    '',
    ...files.map((fileName) => classElement(inputDir, fileName)),
  ].join('\r\n');

  fs.writeFileSync(targetPath, encodeImportableXpo(xpo));
  process.stdout.write(`Generated ${targetPath} with ${files.length} classes.\n`);
}

if (require.main === module) {
  buildXpo({ sourceDir, outputPath, classFiles });
}

module.exports = { buildXpo };

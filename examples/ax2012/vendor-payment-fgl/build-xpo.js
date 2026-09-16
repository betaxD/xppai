'use strict';

const path = require('path');
const { buildXpo } = require('../vendor-payment/build-xpo');

const sourceDir = __dirname;

buildXpo({
  sourceDir,
  outputPath: path.join(sourceDir, 'VendPaymentContract_FGL.xpo'),
  classFiles: ['VendPaymentContract_FGL.xpp'],
});

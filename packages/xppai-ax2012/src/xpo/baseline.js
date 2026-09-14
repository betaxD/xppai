'use strict';

function declaredValue(declared) {
  return declared && String(declared).trim() ? String(declared).trim() : 'Unknown';
}

function isAcceptedR3(value) {
  return /^(?:microsoft dynamics )?ax 2012 r3$/i.test(value) || /^2012-r3$/i.test(value) || /^6\.3(?:\b|$)/.test(value);
}

function inferBaseline(parseResult, declared, context = {}) {
  const text = String(parseResult.sourceText || '');
  const declaredBaseline = declaredValue(declared);
  const conflicts = [];
  if (declaredBaseline !== 'Unknown' && !isAcceptedR3(declaredBaseline)) {
    conflicts.push({
      strength: 'strong',
      source: 'declared',
      evidence: declaredBaseline,
      reason: 'declared baseline is not Microsoft Dynamics AX 2012 R3',
    });
  }
  const syntaxSignals = [
    [/\[\s*ExtensionOf\s*\(/i, 'D365 ExtensionOf syntax'],
    [/\bDynamics 365\b|\bFinance and Operations\b/i, 'D365 product marker'],
    [/\bAX\s*2009\b|\bDynamics AX\s*2009\b/i, 'AX 2009 product marker'],
    [/\b(?:Dynamics )?AX\s*2012\s*R[12]\b|\bversion\s*[:=]\s*6\.[012]\b/i, 'non-R3 version metadata'],
  ];
  for (const [pattern, evidence] of syntaxSignals) {
    if (pattern.test(text)) conflicts.push({ strength: 'strong', source: 'syntax', evidence, reason: 'foreign baseline signal' });
  }

  let inferred = { value: 'Unknown', confidence: 'unknown', provenance: 'no build or model evidence' };
  if (context.build && /^6\.3(?:\b|\.)/.test(String(context.build))) {
    inferred = { value: '2012-R3', confidence: 'medium', provenance: `build ${context.build}` };
  }
  return {
    expected: { value: '2012-R3', confidence: 'contract', provenance: 'xppai-ax2012 package identity' },
    declared: {
      value: declaredBaseline,
      confidence: declaredBaseline === 'Unknown' ? 'unknown' : 'declared',
      provenance: declaredBaseline === 'Unknown' ? 'not supplied' : 'caller declaration',
    },
    inferred,
    conflicts,
  };
}

module.exports = { inferBaseline };

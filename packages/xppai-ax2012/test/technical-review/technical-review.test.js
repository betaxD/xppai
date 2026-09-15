const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const PACKAGE_ROOT = path.resolve(__dirname, '../..');
const REVIEW_PATH = path.join(PACKAGE_ROOT, 'docs/technical-review.md');
const ACCEPTANCE_SCENARIOS = [
  'Explain an existing SysOperation',
  'Develop a complete SysOperation',
  'Explain an AIF integration',
  'Develop an AIF service',
  'Correct a handler bug',
  'Assess a model/deployment change',
  'Detect an incompatible-version artifact',
  'Install AX 2009 and AX 2012 side by side',
];

function replaceAcceptanceResults(review, observedResult, unknowns) {
  return review
    .split(/\r?\n/)
    .map((line) => {
      if (!line.startsWith('|')) return line;
      const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
      if (!ACCEPTANCE_SCENARIOS.includes(cells[0])) return line;
      cells[5] = observedResult;
      cells[6] = unknowns;
      return `| ${cells.join(' | ')} |`;
    })
    .join('\n');
}

function replaceSignature(review, label, value) {
  return review.replace(new RegExp(`^- ${label}:.*$`, 'm'), `- ${label}: ${value}`);
}

function humanReviewFixture(review, decision) {
  let fixture = replaceAcceptanceResults(review, 'Observed the expected safe route and gate behavior.', 'None');
  fixture = replaceSignature(fixture, 'Reviewer name', 'Synthetic Expert');
  fixture = replaceSignature(fixture, 'Review date', '2026-09-15');
  fixture = replaceSignature(fixture, 'Application build', '6.3.5000.0');
  fixture = replaceSignature(fixture, 'Kernel build', '6.3.5000.0');
  fixture = replaceSignature(fixture, 'CU and hotfix context', 'Synthetic CU evidence');
  return replaceSignature(fixture, 'Decision', decision);
}

test('automated technical review blocks forbidden constructs and unsupported certainty', () => {
  const result = spawnSync(process.execPath, ['scripts/verify-technical-review.js', '--automated-only'], {
    cwd: PACKAGE_ROOT,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /automated technical review passed/i);
  assert.doesNotMatch(result.stdout, /unchecked production-ready claim/i);
});

test('technical review distinguishes prohibitions from positive incompatible guidance', () => {
  const { findForbiddenGuidance } = require('../../scripts/verify-technical-review');

  assert.deepEqual(findForbiddenGuidance('Do not use Chain of Command in AX 2012 R3.'), []);
  assert.deepEqual(
    findForbiddenGuidance('Install both products and use ownership manifests to preserve AX 2009 assets.'),
    [],
  );
  assert.equal(findForbiddenGuidance('Use Chain of Command to extend this method.').length, 1);
  assert.equal(findForbiddenGuidance('Use an AX 2009 fallback for this implementation.').length, 1);
  assert.equal(findForbiddenGuidance('Use a post-handler only for this override.').length, 1);
  assert.equal(
    findForbiddenGuidance('```xpp\n[ExtensionOf(classStr(Demo))]\nfinal class Demo_Extension {}\n```').length,
    1,
  );
});

test('technical review distinguishes restricted from unqualified production-ready claims', () => {
  const { findUnqualifiedProductionClaims } = require('../../scripts/verify-technical-review');

  assert.deepEqual(
    findUnqualifiedProductionClaims('Production-ready guidance prohibits direct updates of posted journals.'),
    [],
  );
  assert.deepEqual(
    findUnqualifiedProductionClaims('A production-ready recommendation identifies the required metadata gates.'),
    [],
  );
  assert.equal(findUnqualifiedProductionClaims('This domain provides production-ready implementation guidance.').length, 1);
});

test('technical review defines every manual first-release acceptance flow', () => {
  const review = fs.readFileSync(REVIEW_PATH, 'utf8');

  assert.match(
    review,
    /\| Scenario \| Route \| References \| Evidence gate \| Expected outcome \| Observed result \| Unknowns \|/,
  );

  const rows = review
    .split(/\r?\n/)
    .filter((line) => /^\| (?:Explain|Develop|Correct|Assess|Detect|Install) /.test(line));

  assert.equal(rows.length, 8);
  for (const scenario of ACCEPTANCE_SCENARIOS) {
    assert(review.includes(`| ${scenario} |`), `missing acceptance flow: ${scenario}`);
  }

  for (const row of rows) {
    const cells = row.split('|').slice(1, -1).map((cell) => cell.trim());
    assert.equal(cells.length, 7, `malformed acceptance row: ${cells[0]}`);
    assert(cells[5], `missing observed result: ${cells[0]}`);
    assert(cells[6], `missing unknowns: ${cells[0]}`);
  }
});

test('human review validation blocks an incomplete synthetic record', () => {
  const { validateHumanReviewRecord } = require('../../scripts/verify-technical-review');
  const review = fs.readFileSync(REVIEW_PATH, 'utf8');
  let incomplete = replaceAcceptanceResults(
    review,
    'REVIEWER TO COMPLETE: describe the observed route and safety behavior.',
    'REVIEWER TO COMPLETE: list unresolved facts or `None`.',
  );
  incomplete = replaceSignature(incomplete, 'Reviewer name', 'REVIEWER TO COMPLETE');
  incomplete = replaceSignature(incomplete, 'Review date', 'REVIEWER TO COMPLETE');
  incomplete = replaceSignature(incomplete, 'Application build', 'REVIEWER TO COMPLETE');
  incomplete = replaceSignature(incomplete, 'Kernel build', 'REVIEWER TO COMPLETE');
  incomplete = replaceSignature(incomplete, 'CU and hotfix context', 'REVIEWER TO COMPLETE');
  incomplete = replaceSignature(incomplete, 'Decision', 'REVIEWER TO COMPLETE');

  assert.throws(() => validateHumanReviewRecord(incomplete), /human technical review incomplete/i);
});

test('a completed human record clears the gate only when the reviewer approves', () => {
  const { validateHumanReviewRecord } = require('../../scripts/verify-technical-review');
  const review = fs.readFileSync(REVIEW_PATH, 'utf8');

  assert.doesNotThrow(() => validateHumanReviewRecord(humanReviewFixture(review, 'APPROVE')));
  assert.throws(
    () => validateHumanReviewRecord(humanReviewFixture(review, 'REJECT')),
    /human technical review rejected/i,
  );
});

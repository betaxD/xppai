const fs = require('node:fs');
const path = require('node:path');

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const ASSET_ROOT = path.join(PACKAGE_ROOT, 'assets');
const DOCS_ROOT = path.join(PACKAGE_ROOT, 'docs');
const REVIEW_PATH = path.join(DOCS_ROOT, 'technical-review.md');

const prohibition = /\b(?:do not|never|must not|forbidden|unsupported|reject(?:s|ed)?|prohibit(?:s|ed)?)\b/i;
const recommendation = /\b(?:use|implement|create|prefer|apply|adopt|add|extend)\b.*\b(?:Chain of Command|D365 extension class|AX 2009(?: fallback| rule| pattern| implementation))\b/i;
const postHandlerOnly = /\b(?:use|implement|prefer)\b.*\bpost-handler\b.*\bonly\b/i;
const forbiddenXpp = [/\[ExtensionOf\s*\(/i, /\bnext\s+\w+\s*\(/i];
const productionQualifier = /\b(?:not|never|must not|only after|requires?|blocked|before|gate(?:s|d)?|evidence|prohibit(?:s|ed|ion)?)\b/i;
const incompleteMarker = /\b(?:REVIEWER TO COMPLETE|pending|not run|unreviewed|to be determined)\b/i;

const acceptanceScenarios = [
  'Explain an existing SysOperation',
  'Develop a complete SysOperation',
  'Explain an AIF integration',
  'Develop an AIF service',
  'Correct a handler bug',
  'Assess a model/deployment change',
  'Detect an incompatible-version artifact',
  'Install AX 2009 and AX 2012 side by side',
];

function markdownFiles(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) return markdownFiles(absolute);
    return entry.isFile() && entry.name.endsWith('.md') ? [absolute] : [];
  });
}

function findForbiddenGuidance(text) {
  const findings = [];

  for (const line of text.split(/\r?\n/)) {
    if ((recommendation.test(line) || postHandlerOnly.test(line)) && !prohibition.test(line)) {
      findings.push({ kind: 'prose', line });
    }
  }

  for (const match of text.matchAll(/```(?:xpp|x\+\+)\s*\r?\n([\s\S]*?)```/gi)) {
    for (const pattern of forbiddenXpp) {
      if (pattern.test(match[1])) findings.push({ kind: 'xpp', pattern: String(pattern) });
    }
  }

  return findings;
}

function requirePatterns(text, patterns, label) {
  for (const pattern of patterns) {
    if (!pattern.test(text)) throw new Error(`missing ${label}: ${pattern}`);
  }
}

function findUnqualifiedProductionClaims(text) {
  return text
    .split(/\r?\n/)
    .filter((line) => /production-ready/i.test(line) && !productionQualifier.test(line));
}

function validateReviewContracts() {
  const manifest = JSON.parse(fs.readFileSync(path.join(ASSET_ROOT, 'references/manifest.json'), 'utf8'));
  const byId = new Map(manifest.references.map((reference) => [reference.id, reference]));

  if (byId.get('business.financial-dimensions')?.status !== 'supported') {
    throw new Error('financial dimensions must be supported');
  }

  const regionalReference = byId.get('business.regionalization');
  if (!regionalReference) throw new Error('missing regionalization reference');

  const regional = fs.readFileSync(path.join(ASSET_ROOT, 'references', regionalReference.path), 'utf8');
  requirePatterns(
    regional,
    [/country\/region/i, /model.*layer|layer.*model/i, /configuration key/i, /metadata/i],
    'regionalization evidence',
  );

  for (const reference of manifest.references.filter(({ status }) => status === 'gated' || status === 'deferred')) {
    const text = fs.readFileSync(path.join(ASSET_ROOT, 'references', reference.path), 'utf8');
    const unqualified = findUnqualifiedProductionClaims(text);

    if (unqualified.length) {
      throw new Error(`unchecked production-ready claim in ${reference.id}: ${unqualified.join(' | ')}`);
    }
  }

  const xpoDocs = fs.readFileSync(path.join(DOCS_ROOT, 'xpo-cache.md'), 'utf8');
  requirePatterns(
    xpoDocs,
    [/\bcomplete\b/i, /\bincomplete\b/i, /\bindeterminate\b/i, /\bUnknown\b/, /original byte/i],
    'XPO uncertainty contract',
  );
}

function parseAcceptanceRows(review) {
  const rows = new Map();

  for (const line of review.split(/\r?\n/)) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    if (acceptanceScenarios.includes(cells[0])) rows.set(cells[0], cells);
  }

  return rows;
}

function signatureValue(review, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return review.match(new RegExp(`^- ${escaped}:\\s*(.+)$`, 'mi'))?.[1]?.trim() || '';
}

function validateHumanReviewRecord(review) {
  const problems = [];
  const rows = parseAcceptanceRows(review);

  for (const scenario of acceptanceScenarios) {
    const cells = rows.get(scenario);
    if (!cells || cells.length !== 7) {
      problems.push(`${scenario}: missing or malformed acceptance row`);
      continue;
    }

    for (const [index, label] of [[5, 'observed result'], [6, 'unknowns']]) {
      if (!cells[index] || incompleteMarker.test(cells[index])) {
        problems.push(`${scenario}: ${label} is incomplete`);
      }
    }
  }

  for (const label of ['Reviewer name', 'Review date', 'Application build', 'Kernel build', 'CU and hotfix context']) {
    const value = signatureValue(review, label);
    if (!value || incompleteMarker.test(value)) problems.push(`${label} is incomplete`);
  }

  const decision = signatureValue(review, 'Decision');
  if (!/^(?:APPROVE|REJECT)$/i.test(decision)) problems.push('Decision must be APPROVE or REJECT');

  if (problems.length) {
    throw new Error(`human technical review incomplete:\n- ${problems.join('\n- ')}`);
  }

  if (/^REJECT$/i.test(decision)) {
    throw new Error('human technical review rejected: resolve the recorded findings and obtain a new signed decision');
  }
}

function validateAutomatedReview() {
  for (const root of [ASSET_ROOT, DOCS_ROOT]) {
    for (const file of markdownFiles(root)) {
      const findings = findForbiddenGuidance(fs.readFileSync(file, 'utf8'));
      if (findings.length) throw new Error(`forbidden guidance in ${file}: ${JSON.stringify(findings)}`);
    }
  }

  validateReviewContracts();
}

function main() {
  validateAutomatedReview();
  process.stdout.write('Automated technical review passed.\n');

  if (!process.argv.includes('--automated-only')) {
    validateHumanReviewRecord(fs.readFileSync(REVIEW_PATH, 'utf8'));
    process.stdout.write('Signed human technical review passed.\n');
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = {
  acceptanceScenarios,
  findForbiddenGuidance,
  findUnqualifiedProductionClaims,
  validateAutomatedReview,
  validateHumanReviewRecord,
  validateReviewContracts,
};

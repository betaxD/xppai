'use strict';

const fs = require('node:fs');
const path = require('node:path');

const FOUNDATIONAL_SKILLS = Object.freeze([
  'xppai-ax2012-core',
  'xppai-ax2012-intake',
  'xppai-ax2012-papai',
]);
const UNVERSIONED_SKILL = /\bxppai-(?!ax2012(?:-|\b))[a-z0-9-]+\b/i;

function resolvePackageRoot(root) {
  const absolute = path.resolve(root);
  return path.basename(absolute).toLowerCase() === 'assets' ? path.dirname(absolute) : absolute;
}

function frontmatterName(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const name = match[1].match(/^name:\s*([^\r\n]+)$/m);
  return name ? name[1].trim() : null;
}

function validateSkillContracts(root) {
  const packageRoot = resolvePackageRoot(root);
  const skillsRoot = path.join(packageRoot, 'assets', 'skills');

  for (const mirror of ['skills', 'commands', 'agents']) {
    if (fs.existsSync(path.join(packageRoot, mirror))) {
      throw new Error(`AX 2012 mirror tree is forbidden: ${mirror}`);
    }
  }

  const names = fs.readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  for (const required of FOUNDATIONAL_SKILLS) {
    if (!names.includes(required)) throw new Error(`missing foundational skill: ${required}`);
  }

  for (const name of names) {
    if (!name.startsWith('xppai-ax2012-')) {
      throw new Error(`invalid AX 2012 skill namespace: ${name}`);
    }
    const skillPath = path.join(skillsRoot, name, 'SKILL.md');
    if (!fs.existsSync(skillPath)) throw new Error(`missing SKILL.md: ${name}`);
    const text = fs.readFileSync(skillPath, 'utf8');
    if (frontmatterName(text) !== name) throw new Error(`invalid skill frontmatter: ${name}`);
    if (!/Microsoft Dynamics AX 2012 R3/.test(text)) throw new Error(`missing AX 2012 R3 baseline: ${name}`);
    if (UNVERSIONED_SKILL.test(text)) throw new Error(`unversioned AX 2009 skill dependency: ${name}`);
    if (fs.existsSync(path.join(skillsRoot, name, 'references'))) {
      throw new Error(`private reference tree is forbidden: ${name}`);
    }
  }

  const agentPath = path.join(skillsRoot, 'xppai-ax2012-papai', 'AGENT.md');
  if (!fs.existsSync(agentPath)) throw new Error('missing Papai AGENT.md');
  const agent = fs.readFileSync(agentPath, 'utf8');
  if (!/Microsoft Dynamics AX 2012 R3/.test(agent) || UNVERSIONED_SKILL.test(agent)) {
    throw new Error('invalid Papai AGENT.md contract');
  }
  return names;
}

module.exports = { FOUNDATIONAL_SKILLS, validateSkillContracts };

'use strict';

const nodePath = require('path');
const fs = require('fs');
const fsHelpers = require('../fs');

function stripFrontmatter(content) {
  if (!content.startsWith('---')) return content;
  const end = content.indexOf('\n---', 3);
  if (end === -1) return content;
  return content.slice(end + 4).trimStart();
}

module.exports = {
  id: 'copilot',

  resolveInstallDir(_opts) {
    return null;
  },

  listOwnedEntries(skillsDir) {
    return fs.readdirSync(skillsDir)
      .filter(name => fs.statSync(nodePath.join(skillsDir, name)).isDirectory())
      .map(name => `${name}.md`)
      .sort();
  },

  export(skillsDir, outDir, _opts = {}) {
    const owned = this.listOwnedEntries(skillsDir);
    fsHelpers.ensureDir(outDir);
    fsHelpers.removeOwned(outDir, owned);

    const skillDirs = fs.readdirSync(skillsDir)
      .filter(name => fs.statSync(nodePath.join(skillsDir, name)).isDirectory())
      .sort();

    for (const name of skillDirs) {
      const skillFile = nodePath.join(skillsDir, name, 'SKILL.md');
      const content = fs.readFileSync(skillFile, 'utf8');
      fs.writeFileSync(nodePath.join(outDir, `${name}.md`), stripFrontmatter(content));
    }
  },
};

#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const { PUBLIC_SKILLS } = require('../src/constants');
const { loadReferenceManifest } = require('../src/skills/manifest');

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const ALLOWED_FILE = /^(?:package\/(?:assets|bin|docs|src)\/|package\/(?:package\.json|README\.md)$)/;

function run(command, args, cwd, env = process.env) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', env });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed:\n${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

function runNpm(args, cwd, env = process.env) {
  if (process.platform === 'win32') {
    return run(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', ['npm', ...args].join(' ')], cwd, env);
  }
  return run('npm', args, cwd, env);
}

function npmJson(args, cwd) {
  return JSON.parse(runNpm([...args, '--json', '--ignore-scripts'], cwd));
}

function packDryRun(packageRoot = PACKAGE_ROOT) {
  const records = npmJson(['pack', '--dry-run'], packageRoot);
  assert.equal(records.length, 1, 'npm pack must produce one artifact');
  return records[0].files.map((file) => ({ ...file, path: `package/${file.path.replace(/\\/g, '/')}` }));
}

function verifyFileContract(packageRoot, files) {
  assert(files.every((file) => ALLOWED_FILE.test(file.path)), 'unexpected tarball file');
  const paths = new Set(files.map((file) => file.path));
  for (const required of ['package/package.json', 'package/README.md', 'package/bin/xppai-ax2012.js', 'package/src/cli.js']) {
    assert(paths.has(required), `missing required artifact file: ${required}`);
  }
  for (const name of PUBLIC_SKILLS) {
    assert(paths.has(`package/assets/skills/${name}/SKILL.md`), `missing skill: ${name}`);
  }
  assert(paths.has('package/assets/skills/xppai-ax2012-papai/AGENT.md'), 'missing Papai AGENT.md');
  for (const ref of loadReferenceManifest(packageRoot).references) {
    assert(paths.has(`package/assets/references/${ref.path}`), `missing reference: ${ref.id}`);
  }
}

function verifyInstalledArtifact(packageRoot = PACKAGE_ROOT) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'xppai-artifact-'));
  try {
    const pack = npmJson(['pack', '--pack-destination', root], packageRoot)[0];
    const tarball = path.join(root, pack.filename);
    const project = path.join(root, 'project');
    fs.mkdirSync(project, { recursive: true });
    fs.writeFileSync(path.join(project, 'package.json'), '{"private":true}\n', 'utf8');
    runNpm(['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball], project);

    const installed = path.join(project, 'node_modules', 'xppai-ax2012');
    const cli = path.join(installed, 'bin', 'xppai-ax2012.js');
    assert.equal(run(process.execPath, [cli, '--version'], project).trim(), '0.1.1');
    assert.equal(run(process.execPath, [cli, 'list'], project).trim().split(/\r?\n/).length, PUBLIC_SKILLS.length);
    assert.equal(fs.realpathSync(run(process.execPath, [cli, 'path'], project).trim()), fs.realpathSync(path.join(installed, 'assets', 'skills')));

    const exported = path.join(root, 'exported');
    run(process.execPath, [cli, 'export', '--target', 'generic', '--out', exported], project);
    assert(fs.existsSync(path.join(exported, 'skills', 'xppai-ax2012-papai', 'AGENT.md')));

    const targetHome = path.join(root, 'home');
    const env = { ...process.env, HOME: targetHome, USERPROFILE: targetHome, LOCALAPPDATA: path.join(root, 'local-app-data') };
    run(process.execPath, [cli, 'install', '--target', 'codex'], project, env);
    assert(fs.existsSync(path.join(targetHome, '.codex', 'skills', 'xppai-ax2012-core', 'SKILL.md')));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function main() {
  const files = packDryRun(PACKAGE_ROOT);
  verifyFileContract(PACKAGE_ROOT, files);
  verifyInstalledArtifact(PACKAGE_ROOT);
  process.stdout.write(`AX 2012 artifact verified: ${files.length} package files\n`);
}

if (require.main === module) {
  try { main(); } catch (error) {
    process.stderr.write(`AX 2012 artifact verification failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { main, packDryRun, verifyFileContract, verifyInstalledArtifact };

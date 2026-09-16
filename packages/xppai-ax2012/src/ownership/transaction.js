'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {
  MANIFEST_NAME,
  createManifest,
  validateManifest,
  validateOwnedPath,
} = require('./manifest');

function compareOrdinal(left, right) {
  return Buffer.from(left, 'utf8').compare(Buffer.from(right, 'utf8'));
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function hashEntry(root) {
  const stat = fs.lstatSync(root);
  if (!stat.isDirectory()) return sha256(Buffer.concat([Buffer.from('file\0'), fs.readFileSync(root)]));
  const rows = [];
  function visit(directory, relativeRoot) {
    const entries = fs.readdirSync(directory, { withFileTypes: true })
      .sort((left, right) => compareOrdinal(left.name, right.name));
    if (entries.length === 0) rows.push(`D\t${relativeRoot}\n`);
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      const relative = path.join(relativeRoot, entry.name).replace(/\\/g, '/');
      if (entry.isDirectory()) visit(absolute, relative);
      else rows.push(`F\t${relative}\t${sha256(fs.readFileSync(absolute))}\n`);
    }
  }
  visit(root, '');
  return sha256(Buffer.from(rows.join(''), 'utf8'));
}

function existsEntry(file) {
  try {
    fs.lstatSync(file);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

function removeEntry(file) {
  if (!existsEntry(file)) return;
  const stat = fs.lstatSync(file);
  if (stat.isSymbolicLink() || !stat.isDirectory()) fs.unlinkSync(file);
  else fs.rmSync(file, { recursive: true, force: true });
}

function copyEntry(source, destination) {
  const stat = fs.lstatSync(source);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  if (stat.isDirectory()) fs.cpSync(source, destination, { recursive: true, errorOnExist: true });
  else fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL);
}

function symlinkEntry(source, destination) {
  const stat = fs.lstatSync(source);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const type = stat.isDirectory() ? (process.platform === 'win32' ? 'junction' : 'dir') : 'file';
  fs.symlinkSync(path.resolve(source), destination, type);
}

function assertWithinRoot(root, relativePath) {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, relativePath);
  const relation = path.relative(resolvedRoot, resolved);
  if (relation.startsWith('..') || path.isAbsolute(relation)) {
    throw new Error(`owned path escapes approved root: ${relativePath}`);
  }
  return resolved;
}

function assetEntries(assetRoot, destinations, mode) {
  const entries = [];
  function addEntry(destination, destinationRoot, ownedPath, sourcePath) {
    const entry = {
      destination,
      destinationRoot,
      destinationPath: assertWithinRoot(destinationRoot, ownedPath),
      path: ownedPath,
      sourcePath,
      kind: mode,
    };
    if (mode === 'copy') entry.contentHash = hashEntry(sourcePath);
    else entry.symlinkTarget = path.resolve(sourcePath);
    entries.push(entry);
  }

  for (const [destination, destinationRoot] of Object.entries(destinations)) {
    const sourceRoot = path.join(assetRoot, destination);
    if (!fs.existsSync(sourceRoot)) continue;
    for (const child of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
      const ownedPath = validateOwnedPath(child.name);
      const sourcePath = path.join(sourceRoot, child.name);
      if (!child.isDirectory() && !child.isFile()) {
        throw new Error(`unsupported asset entry type: ${sourcePath}`);
      }
      addEntry(destination, destinationRoot, ownedPath, sourcePath);
    }
  }

  const referencesRoot = path.join(assetRoot, 'references');
  const referenceManifest = path.join(referencesRoot, 'manifest.json');
  if (!fs.existsSync(referenceManifest) || !fs.statSync(referencesRoot).isDirectory()) {
    throw new Error(`canonical reference bundle is missing: ${referenceManifest}`);
  }
  const ownedPath = validateOwnedPath('xppai-ax2012-references');
  addEntry('skills', destinations.skills, ownedPath, referencesRoot);

  return entries.sort((left, right) => compareOrdinal(
    `${left.destination}/${left.path}`,
    `${right.destination}/${right.path}`,
  ));
}

function manifestEntry(entry) {
  const result = { destination: entry.destination, path: entry.path, kind: entry.kind };
  if (entry.kind === 'copy') result.contentHash = entry.contentHash;
  else result.symlinkTarget = entry.symlinkTarget;
  return result;
}

function buildInstallPlan({ assetRoot, destinations, target, mode = 'copy', version }) {
  if (!assetRoot || !fs.existsSync(assetRoot)) throw new Error(`asset root does not exist: ${assetRoot}`);
  if (!destinations || !destinations.skills) throw new Error('an approved skills destination is required');
  if (!['copy', 'symlink'].includes(mode)) throw new Error(`unsupported install mode: ${mode}`);
  const resolvedDestinations = Object.fromEntries(
    Object.entries(destinations).map(([name, value]) => [name, path.resolve(String(value))]),
  );
  const entries = assetEntries(path.resolve(assetRoot), resolvedDestinations, mode);
  const manifest = createManifest({
    version,
    target,
    mode,
    destinations: resolvedDestinations,
    entries: entries.map(manifestEntry),
  });
  return {
    assetRoot: path.resolve(assetRoot),
    destinations: resolvedDestinations,
    entries,
    manifest,
    manifestPath: path.join(resolvedDestinations.skills, MANIFEST_NAME),
    mode,
    target,
  };
}

function readPreviousManifest(plan) {
  if (!fs.existsSync(plan.manifestPath)) return { manifest: null, bytes: null };
  const bytes = fs.readFileSync(plan.manifestPath);
  let manifest;
  try {
    manifest = validateManifest(JSON.parse(bytes.toString('utf8')));
  } catch (error) {
    throw new Error(`cannot use previous AX 2012 ownership manifest: ${error.message}`);
  }
  if (manifest.target !== plan.target) throw new Error('previous ownership manifest target mismatch');
  for (const [name, destination] of Object.entries(manifest.destinations)) {
    if (!plan.destinations[name] || path.resolve(destination) !== path.resolve(plan.destinations[name])) {
      throw new Error(`previous ownership manifest destination mismatch: ${name}`);
    }
  }
  return { manifest, bytes };
}

function comparablePath(value) {
  return path.resolve(value).replace(/\\/g, '/').toLowerCase();
}

function validateInstalledEntry(entry, active) {
  if (entry.kind === 'copy') {
    if (hashEntry(active) !== entry.contentHash) {
      throw new Error(`owned destination changed since the previous manifest: ${active}`);
    }
    return;
  }
  const stat = fs.lstatSync(active);
  if (!stat.isSymbolicLink()) {
    throw new Error(`owned destination changed since the previous manifest: ${active}`);
  }
  const actualTarget = fs.realpathSync.native(active);
  const expectedTarget = fs.realpathSync.native(entry.symlinkTarget);
  if (comparablePath(actualTarget) !== comparablePath(expectedTarget)) {
    throw new Error(`owned destination changed since the previous manifest: ${active}`);
  }
}

function transactionDirectories(destinations) {
  const token = `${process.pid}-${crypto.randomBytes(6).toString('hex')}`;
  return Object.fromEntries(Object.entries(destinations).map(([name, root]) => [name, {
    stage: path.join(root, `.xppai-ax2012-stage-${token}`),
    backup: path.join(root, `.xppai-ax2012-backup-${token}`),
  }]));
}

function atomicWrite(file, bytes) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = path.join(
    path.dirname(file),
    `.${path.basename(file)}.${process.pid}.${crypto.randomBytes(6).toString('hex')}.tmp`,
  );
  try {
    fs.writeFileSync(temporary, bytes, { flag: 'wx' });
    fs.renameSync(temporary, file);
  } catch (error) {
    fs.rmSync(temporary, { force: true });
    throw error;
  }
}

function applyInstallPlan(plan, options = {}) {
  const previous = readPreviousManifest(plan);
  const previousKeys = new Set((previous.manifest?.entries || []).map(
    (entry) => `${entry.destination}\0${entry.path}`,
  ));
  for (const entry of previous.manifest?.entries || []) {
    const active = assertWithinRoot(plan.destinations[entry.destination], entry.path);
    if (existsEntry(active)) validateInstalledEntry(entry, active);
  }
  for (const entry of plan.entries) {
    const key = `${entry.destination}\0${entry.path}`;
    if (existsEntry(entry.destinationPath) && !previousKeys.has(key)) {
      throw new Error(`unowned destination collision: ${entry.destinationPath}`);
    }
  }

  const directories = transactionDirectories(plan.destinations);
  const moved = [];
  const activated = [];
  let manifestWritten = false;
  try {
    for (const root of Object.values(plan.destinations)) fs.mkdirSync(root, { recursive: true });
    for (const entry of plan.entries) {
      const staged = assertWithinRoot(directories[entry.destination].stage, entry.path);
      if (entry.kind === 'copy') {
        copyEntry(entry.sourcePath, staged);
        if (hashEntry(staged) !== entry.contentHash) throw new Error(`staged content hash mismatch: ${entry.path}`);
      } else {
        symlinkEntry(entry.sourcePath, staged);
        if (!fs.lstatSync(staged).isSymbolicLink()) throw new Error(`staged symlink validation failed: ${entry.path}`);
      }
    }

    for (const entry of previous.manifest?.entries || []) {
      validateOwnedPath(entry.path);
      const destinationRoot = plan.destinations[entry.destination];
      const active = assertWithinRoot(destinationRoot, entry.path);
      if (!existsEntry(active)) continue;
      const backup = assertWithinRoot(directories[entry.destination].backup, entry.path);
      fs.mkdirSync(path.dirname(backup), { recursive: true });
      fs.renameSync(active, backup);
      moved.push({ active, backup });
    }

    for (const entry of plan.entries) {
      const staged = assertWithinRoot(directories[entry.destination].stage, entry.path);
      fs.mkdirSync(path.dirname(entry.destinationPath), { recursive: true });
      fs.renameSync(staged, entry.destinationPath);
      activated.push(entry.destinationPath);
      if (options.failAt === 'activation') throw new Error('simulated activation failure');
    }

    if (options.failAt === 'manifest-write') throw new Error('simulated manifest-write failure');
    atomicWrite(plan.manifestPath, Buffer.from(`${JSON.stringify(plan.manifest, null, 2)}\n`, 'utf8'));
    manifestWritten = true;
    if (options.failAt === 'after-manifest-write') throw new Error('simulated after-manifest-write failure');

    for (const value of Object.values(directories)) {
      removeEntry(value.stage);
      removeEntry(value.backup);
    }
    return plan.manifest;
  } catch (error) {
    for (const active of activated.reverse()) removeEntry(active);
    for (const { active, backup } of moved.reverse()) {
      if (existsEntry(backup)) {
        fs.mkdirSync(path.dirname(active), { recursive: true });
        fs.renameSync(backup, active);
      }
    }
    if (previous.bytes) atomicWrite(plan.manifestPath, previous.bytes);
    else if (manifestWritten || fs.existsSync(plan.manifestPath)) fs.rmSync(plan.manifestPath, { force: true });
    for (const value of Object.values(directories)) {
      removeEntry(value.stage);
      removeEntry(value.backup);
    }
    throw error;
  }
}

module.exports = { applyInstallPlan, buildInstallPlan, hashEntry };

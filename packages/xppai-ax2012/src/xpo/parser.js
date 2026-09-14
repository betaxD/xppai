'use strict';

const crypto = require('node:crypto');

const { inferBaseline } = require('./baseline');
const { decodeSource } = require('./encoding');
const { resolveRegistryEntry } = require('./registry-v1');
const { scanCandidates } = require('./scanner');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function lineCount(text) {
  if (!text) return 1;
  return text.split(/\r\n|\n|\r/).length;
}

function offsets(start, endCharacter, endByte, endLine) {
  return {
    byte: { start: start.startByte, end: endByte },
    character: { start: start.startCharacter, end: endCharacter },
    line: { start: start.line, end: endLine },
  };
}

function provenance(context, decoded) {
  return {
    parser: 'xppai-ax2012-registry-v1',
    registryVersion: 1,
    sourcePath: context.sourcePath || null,
    encoding: decoded.encoding,
  };
}

function parseXpo(bytes, context = {}) {
  const decoded = decodeSource(bytes);
  const candidates = scanCandidates(decoded);
  const objects = [];
  const fragments = [];
  const warnings = [];
  let open = null;
  let unknown = null;

  function finishObject(endCharacter, endByte, endLine, state, reason = null) {
    const content = decoded.text.slice(open.start.startCharacter, endCharacter);
    const objectWarnings = warnings.filter((warning) => warning.ownerStartByte === open.start.startByte);
    const completeness = state === 'complete' && objectWarnings.length ? 'indeterminate' : state;
    objects.push({
      registryVersion: 1,
      rawType: open.start.rawType,
      canonicalType: open.entry.canonicalType,
      name: open.start.name || 'Unknown',
      header: open.start.header,
      hierarchy: Array.isArray(context.hierarchy) ? [...context.hierarchy] : [],
      offsets: offsets(open.start, endCharacter, endByte, endLine),
      content,
      contentHash: sha256(decoded.bytes.subarray(open.start.startByte, endByte)),
      completeness,
      reason: reason || (objectWarnings.length ? objectWarnings[0].reason : null),
      layer: context.layer || 'Unknown',
      model: context.model || 'Unknown',
      provenance: provenance(context, decoded),
    });
    open = null;
  }

  function finishFragment(endCharacter, endByte, endLine) {
    const content = decoded.text.slice(unknown.startCharacter, endCharacter);
    fragments.push({
      rawType: unknown.rawType,
      name: unknown.name,
      content,
      contentHash: sha256(decoded.bytes.subarray(unknown.startByte, endByte)),
      offsets: offsets(unknown, endCharacter, endByte, endLine),
      completeness: 'indeterminate',
      reason: 'unknown top-level token',
      provenance: provenance(context, decoded),
    });
    unknown = null;
  }

  for (const candidate of candidates) {
    const registered = resolveRegistryEntry(candidate.rawType);
    if (!open) {
      if (unknown) {
        if (candidate.rawType === `END${unknown.rawType}`) {
          finishFragment(candidate.endCharacter, candidate.endByte, candidate.line);
          continue;
        }
        if ((registered && candidate.name) || (!registered && candidate.name)) {
          finishFragment(candidate.startCharacter, candidate.startByte, Math.max(unknown.line, candidate.line - 1));
        } else {
          continue;
        }
      }
      if (registered && candidate.name) {
        open = { entry: registered, start: candidate };
      } else if (!registered && candidate.name && !candidate.rawType.startsWith('END')) {
        unknown = candidate;
      }
      continue;
    }

    if (candidate.rawType === open.entry.closer) {
      finishObject(candidate.endCharacter, candidate.endByte, candidate.line, 'complete');
      continue;
    }
    if (candidate.rawType === 'SOURCE' || (registered && candidate.name)) {
      warnings.push({
        reason: `nested header ${candidate.rawType} remained inside ${open.entry.canonicalType}`,
        rawType: candidate.rawType,
        line: candidate.line,
        byteOffset: candidate.startByte,
        ownerStartByte: open.start.startByte,
      });
    }
  }

  if (open) {
    finishObject(
      decoded.text.length,
      decoded.bytes.length,
      lineCount(decoded.text),
      'incomplete',
      `missing ${open.entry.closer} required by registry v1`,
    );
  }
  if (unknown) finishFragment(decoded.text.length, decoded.bytes.length, lineCount(decoded.text));

  let completeness = 'complete';
  if (objects.some((value) => value.completeness === 'incomplete')) completeness = 'incomplete';
  else if (fragments.length || warnings.length || objects.some((value) => value.completeness === 'indeterminate')) {
    completeness = 'indeterminate';
  }

  const result = {
    registryVersion: 1,
    encoding: decoded.encoding,
    byteLength: decoded.bytes.length,
    originalByteHash: sha256(decoded.bytes),
    objects,
    fragments,
    warnings,
    completeness,
  };
  result.baseline = inferBaseline(
    { ...result, sourceText: decoded.text },
    context.declaredBaseline,
    context,
  );
  return result;
}

module.exports = { parseXpo };

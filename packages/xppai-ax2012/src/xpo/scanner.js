'use strict';

function scanCandidates(decoded) {
  const candidates = [];
  const text = decoded.text;
  let start = 0;
  let line = 1;

  while (start < text.length) {
    let newline = text.indexOf('\n', start);
    const end = newline === -1 ? text.length : newline + 1;
    let lineText = text.slice(start, newline === -1 ? text.length : newline);
    if (lineText.endsWith('\r')) lineText = lineText.slice(0, -1);
    const match = /^([A-Z][A-Z0-9]*)(?:[ \t]+#?([^\r\n]+?))?[ \t]*$/.exec(lineText);
    if (match) {
      const header = match[2] ? match[2].trim() : null;
      candidates.push({
        rawType: match[1],
        header,
        name: header ? header.replace(/^#/, '').trim() : null,
        line,
        startCharacter: start,
        endCharacter: end,
        startByte: decoded.byteOffsetAt(start),
        endByte: decoded.byteOffsetAt(end),
      });
    }
    start = end;
    line += 1;
  }
  return candidates;
}

module.exports = { scanCandidates };

# Independent Publication Checklist

Use this checklist from `packages/xppai-ax2012/` before publishing `xppai-ax2012`. Do not run `npm publish` until every item is complete.

- [ ] Record human AX 2012 technical approval in the signed technical review record.
- [ ] Confirm the clean root AX 2009 baseline with the approved preservation check.
- [ ] Run the clean sibling test run: `npm test`.
- [ ] Run artifact install smoke tests: `npm run verify:artifact`.
- [ ] Run side-by-side target tests: `npm run verify:side-by-side`.
- [ ] Run the complete publication gate: `npm run prepublishOnly`.
- [ ] Run `npm pack` and inspect the tarball contents for sibling-owned `assets/`, `bin/`, `docs/`, and `src/` files only.
- [ ] Perform the version bump in the sibling only: `packages/xppai-ax2012/package.json`.
- [ ] From `packages/xppai-ax2012/`, run `npm publish` only after all previous checks pass.

The repository-root AX 2009 package remains independent and must not be published or modified as part of this release.

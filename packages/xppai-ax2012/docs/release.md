# Release Verification

Release is independent from the repository-root product and runs from `packages/xppai-ax2012/`.

1. Source: clean sibling branch, exact root preservation, lockfile, tests, manifest reachability, and no mirrored asset trees.
2. Tarball: dry-run allowlist, real pack/install smoke test, Papai/AGENT, all skills/references/commands, runtime, and docs present.
3. Target: copy and symlink install/upgrade/retirement/rollback for every adapter.
4. Side-by-side: sibling operations preserve the root package, its installed assets, cache, and user-owned sentinels byte-for-byte.
5. Technical review: automated forbidden-guidance gate plus signed human AX 2012 R3 acceptance scenarios.
6. Publish: run the complete `prepublishOnly` gate, inspect the tarball, bump only the sibling version, and publish from this directory.

Do not publish when a source, artifact, target, side-by-side, technical review, or baseline-preservation check is missing or failing.

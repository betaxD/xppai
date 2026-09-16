# Targets and Ownership

Install targets are Claude (`~/.claude/skills` and commands), Codex (`~/.codex/skills`), Qwen (`~/.qwen/skills`), and Copilot (`<repository>/.github/skills`). Generic is export-only. Every export stays below `--out`.

Copy mode writes validated sibling-owned content. Symlink mode records the exact link target. Both modes stage the complete multi-destination update, validate it, and use rollback to restore the prior tree if any replacement or manifest step fails.

Every install and export places one `xppai-ax2012-references` bundle below the target skills root. The bundle is sourced directly from canonical `assets/references/`; copy mode copies it and symlink mode links it without creating a second source tree.

Each destination records `.xppai-ax2012-owned.json` with schema, package/version, target, mode, destination roots, and exact entries plus content hashes or symlink targets. A namespace prefix is a validation boundary, not deletion authority.

Upgrade may retire only entries recorded by the previous manifest, still under an approved destination, still in the sibling namespace, and unchanged since installation. User-owned collisions and modified installed content stop the transaction. Reinstall is idempotent and unrelated files remain byte-identical.

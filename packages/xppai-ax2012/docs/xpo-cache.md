# XPO Cache

Every identity, extract, index, and session-authorization record contains `schemaVersion: 1`, product `Microsoft Dynamics AX`, baseline `2012-R3`, and producer package `xppai-ax2012`. Missing, foreign, older, or newer incompatible identity is rejected without mutation or implicit migration.

Resolution precedence is `--cache-dir` -> user config `ax2012XpoCacheDir` -> environment `XPPAI_AX2012_CACHE_DIR` -> default `%LOCALAPPDATA%/xppai-ax2012/cache/xpo/`. Session authorization always resides at `<resolved-cache-dir>/xpo-session-auth.json`.

History is append-only by normalized source identity and original-byte hash. Identical input is idempotent. Each source has one explicit active revision, but queries and comparisons may name another revision.

Diff/export requires an explicit base and head revision and reports added, modified, and removed objects. No automatic pruning occurs; retention is an operator decision and is not part of the first release.

The parser preserves original bytes, encoding/BOM, hashes, offsets, provenance, and `complete`, `incomplete`, or `indeterminate` status. Facts not established by preserved evidence remain `Unknown`; parser completeness is never silently promoted. A snapshot authorizes bounded reads against one index fingerprint and expires when history changes.

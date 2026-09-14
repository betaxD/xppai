# xppai-ax2012

Independent skill suite and CLI for evidence-driven Microsoft Dynamics AX 2012 R3 work. This sibling package has its own lockfile, assets, cache, installation ownership, tests, and release lifecycle; the repository root is not an npm workspace.

The package does not provide AX 2009 or D365 implementation guidance. It can be installed side-by-side with xppai@1.0.22 without sharing skills, cache, manifests, or release state.

## Install

```powershell
npm install -g xppai-ax2012
xppai-ax2012 install --target codex
```

Run package development commands from `packages/xppai-ax2012/` only:

```powershell
npm ci
npm test
node bin/xppai-ax2012.js --help
```

## CLI

- `list` and `path` inspect the canonical sibling assets.
- `install --target <claude|codex|qwen|copilot> [--mode copy|symlink]` installs transactionally.
- `export --target <claude|codex|qwen|copilot|generic> --out <path>` keeps all output below the requested path.
- `xpo` provides `load`, `load-stdin`, `snapshot`, `list`, `read`, `grep`, and `export-modified`.

## Evidence and cache

Direct local XPO files and pasted XPO use one byte-preserving parser. Conclusions use `Confirmed`, `Likely`, `Hypothesis`, and `Unknown`; XPO does not prove effective layer/model, xRef, subscribers, build, or environment state.

The default cache is `%LOCALAPPDATA%/xppai-ax2012/cache/xpo/`. Override it with `--cache-dir`, user config key `ax2012XpoCacheDir`, or `XPPAI_AX2012_CACHE_DIR` in that precedence order. Foreign or incompatible cache identity is rejected without mutation.

See [CLI](docs/cli.md), [skills](docs/skills.md), [XPO cache](docs/xpo-cache.md), [targets](docs/targets.md), and [release](docs/release.md).

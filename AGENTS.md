# Repository Instructions

This repository publishes two shared npm-check-updates configurations for use directly from `node_modules`.

## Priorities

- Keep `.ncurc.json` and `.ncurc.workspaces.json` aligned except for intentional workspace behavior.
- Do not embed `configFileName` or `configFilePath` in either preset; consumers supply those discovery flags.
- Preserve consumer-owned package paths and repository-specific dependency filters.
- Verify option changes against the installed npm-check-updates version and its official schema.
- Keep both raw configs, the typed helper, documentation, and consumer smoke tests synchronized.
- Do not weaken security scanners, release gates, workflow permissions, or action pinning.

## Common Commands

```bash
npm run build
npm run lint:all
npm run typecheck
npm run test
npm run release:verify
```

## Published Surface

- `.ncurc.json` is the non-workspace preset.
- `.ncurc.workspaces.json` checks the root and declared npm workspaces.
- `src/ncu-config.ts` exposes typed file names, resolved paths, parsing, and loading helpers.
- Consumers invoke `ncu` with separate `--configFileName` and `--configFilePath` arguments.

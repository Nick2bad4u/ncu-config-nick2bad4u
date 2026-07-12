# ncu-config-nick2bad4u

[![NPM license.](https://flat.badgen.net/npm/license/ncu-config-nick2bad4u?color=purple)](https://github.com/Nick2bad4u/ncu-config-nick2bad4u/blob/main/LICENSE) [![NPM total downloads.](https://flat.badgen.net/npm/dt/ncu-config-nick2bad4u?color=pink)](https://www.npmjs.com/package/ncu-config-nick2bad4u) [![Latest GitHub release.](https://flat.badgen.net/github/release/Nick2bad4u/ncu-config-nick2bad4u?color=cyan)](https://github.com/Nick2bad4u/ncu-config-nick2bad4u/releases) [![GitHub stars.](https://flat.badgen.net/github/stars/Nick2bad4u/ncu-config-nick2bad4u?color=yellow)](https://github.com/Nick2bad4u/ncu-config-nick2bad4u/stargazers) [![GitHub forks.](https://flat.badgen.net/github/forks/Nick2bad4u/ncu-config-nick2bad4u?color=orange)](https://github.com/Nick2bad4u/ncu-config-nick2bad4u/forks) [![GitHub open issues.](https://flat.badgen.net/github/open-issues/Nick2bad4u/ncu-config-nick2bad4u?color=red)](https://github.com/Nick2bad4u/ncu-config-nick2bad4u/issues) [![Codecov.](https://flat.badgen.net/codecov/github/Nick2bad4u/ncu-config-nick2bad4u?color=blue)](https://codecov.io/gh/Nick2bad4u/ncu-config-nick2bad4u) [![Repo Checks.](https://flat.badgen.net/github/checks/Nick2bad4u/ncu-config-nick2bad4u?color=green)](https://github.com/Nick2bad4u/ncu-config-nick2bad4u/actions)

Shared [npm-check-updates](https://github.com/raineorshine/npm-check-updates) configurations for Nick2bad4u npm repositories.

## Install

```bash
npm install --save-dev npm-check-updates ncu-config-nick2bad4u
```

## Non-workspace repositories

Point NCU at the standard config from a package script:

```json
{
 "scripts": {
  "update-deps": "ncu --configFileName .ncurc.json --configFilePath node_modules/ncu-config-nick2bad4u"
 }
}
```

## npm workspaces

Use the workspace preset when the root `package.json` declares npm workspaces:

```json
{
 "scripts": {
  "update-deps": "ncu --configFileName .ncurc.workspaces.json --configFilePath node_modules/ncu-config-nick2bad4u"
 }
}
```

The workspace preset checks the root package and every declared workspace. Both presets enable NCU's interactive upgrade flow, so `npm run update-deps` prompts for selections and updates matching manifests. Command-line options take precedence when a one-off run needs different behavior.

## Programmatic access

The package exports stable file names, absolute paths, and a validated loader:

```ts
import {
 loadNcuConfig,
 ncuConfigPath,
 ncuWorkspacesConfigPath,
} from "ncu-config-nick2bad4u";

const standardConfig = await loadNcuConfig();
const workspaceConfig = await loadNcuConfig("workspaces");

console.log(ncuConfigPath, ncuWorkspacesConfigPath);
console.log(standardConfig.workspaces, workspaceConfig.workspaces);
```

The raw JSON files are also exported for JSON-module consumers:

```ts
import standardConfig from "ncu-config-nick2bad4u/.ncurc.json" with { type: "json" };
import workspaceConfig from "ncu-config-nick2bad4u/.ncurc.workspaces.json" with { type: "json" };
```

## Shared defaults

- Uses npm and the public npm registry with eight concurrent requests and three retries.
- Checks production, development, optional, and package-manager dependencies against the `latest` tag.
- Requires versions to be at least one minute old and caches registry results for 60 minutes.
- Groups interactive results by dependency type, version impact, ownership changes, publication time, and homepage.
- Excludes prereleases by default, preserves version ranges, and never installs dependencies automatically.
- Merges nested configs so workspace-specific policies can extend the shared root policy.
- Keeps the standard and workspace behaviors separate through `workspaces: false` and `workspaces: true`.

The config-location flags intentionally stay in the consuming command. NCU uses `configFileName` and `configFilePath` to find an rc file, so embedding either selector inside the file it already loaded is ineffective and non-portable.

## Verification

```bash
npm run release:verify
npm pack --dry-run
```

See [the maintenance checklist](docs/UPDATE_CHECKLIST.md) when updating NCU or changing the published policy.

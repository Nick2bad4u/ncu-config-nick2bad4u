# ncu-config-nick2bad4u

[![NPM license.](https://flat.badgen.net/npm/license/ncu-config-nick2bad4u?color=purple)](https://github.com/Nick2bad4u/ncu-config-nick2bad4u/blob/main/LICENSE) [![NPM total downloads.](https://flat.badgen.net/npm/dt/ncu-config-nick2bad4u?color=pink)](https://www.npmjs.com/package/ncu-config-nick2bad4u) [![Latest GitHub release.](https://flat.badgen.net/github/release/Nick2bad4u/ncu-config-nick2bad4u?color=cyan)](https://github.com/Nick2bad4u/ncu-config-nick2bad4u/releases) [![GitHub stars.](https://flat.badgen.net/github/stars/Nick2bad4u/ncu-config-nick2bad4u?color=yellow)](https://github.com/Nick2bad4u/ncu-config-nick2bad4u/stargazers) [![GitHub forks.](https://flat.badgen.net/github/forks/Nick2bad4u/ncu-config-nick2bad4u?color=orange)](https://github.com/Nick2bad4u/ncu-config-nick2bad4u/forks) [![GitHub open issues.](https://flat.badgen.net/github/open-issues/Nick2bad4u/ncu-config-nick2bad4u?color=red)](https://github.com/Nick2bad4u/ncu-config-nick2bad4u/issues) [![Codecov.](https://flat.badgen.net/codecov/github/Nick2bad4u/ncu-config-nick2bad4u?color=blue)](https://codecov.io/gh/Nick2bad4u/ncu-config-nick2bad4u) [![SonarCloud quality gate.](https://sonarcloud.io/api/project_badges/measure?project=Nick2bad4u_ncu-config-nick2bad4u&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Nick2bad4u_ncu-config-nick2bad4u) [![Repo Checks.](https://flat.badgen.net/github/checks/Nick2bad4u/ncu-config-nick2bad4u?color=green)](https://github.com/Nick2bad4u/ncu-config-nick2bad4u/actions)

Shared [npm-check-updates](https://github.com/raineorshine/npm-check-updates) configurations for Nick2bad4u npm repositories.

The package keeps dependency-update policy in one published place and provides separate presets for ordinary packages and npm workspaces. TypeScript is temporarily held back in both presets so repositories do not move to TypeScript 7 before the shared toolchain is ready.

## Install

```bash
npm install --save-dev npm-check-updates ncu-config-nick2bad4u
```

The typed helper is ESM-only and supports Node.js `^22.22.3 || ^24.16.0 || >=26.3.0`. The presets support npm-check-updates `^22.2.9 || ^23.0.0`.

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

The workspace preset sets `workspaces: true` and `root: true`, so it checks the root package and every declared workspace. It keeps `deep: false`; npm workspace traversal and arbitrary nested `package.json` discovery are different NCU modes and cannot be enabled together.

Both presets enable NCU's interactive upgrade flow. `npm run update-deps` prompts for selections and writes the selected version ranges to matching manifests, but `install: "never"` prevents NCU from running `npm install`. Command-line options take precedence for one-off behavior.

## Temporary TypeScript holdback

Both presets currently publish this shared exclusion:

```json
{
 "reject": ["typescript"]
}
```

This freezes TypeScript at the version already declared by each consumer while allowing other dependencies to update. NCU's JSON configuration cannot reject only TypeScript versions `>=7` by package name: a JSON `rejectVersion` pattern would apply to every dependency, while package-aware predicates require a JavaScript config. Remove `typescript` from the shared `reject` list once the shared TypeScript/ESLint/testing stack supports TypeScript 7.

## Programmatic access

The package exports stable file names, absolute paths, and a typed loader that verifies the selected workspace mode:

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

The public helper surface is:

- `ncuConfigFileName` and `ncuWorkspacesConfigFileName` for stable published filenames.
- `ncuConfigPath` and `ncuWorkspacesConfigPath` for absolute installed paths.
- `loadNcuConfig` to read a preset and verify its workspace mode.
- `parseNcuConfig` to mode-check an already parsed object.
- `NcuConfig` and `NcuConfigMode` for TypeScript consumers.

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
- Temporarily excludes the `typescript` package, preventing an automatic TypeScript 7 upgrade.
- Enables NCU's root-config merging when consumers explicitly use deep or package-file discovery.
- Keeps the standard and workspace behaviors separate through `workspaces: false` and `workspaces: true`.

The config-location flags intentionally stay in the consuming command. NCU uses `configFileName` and `configFilePath` to find a rc file, so embedding either selector inside the file it already loaded is ineffective and non-portable.

## Verification

```bash
npm run release:verify
npm pack --dry-run
```

See [the configuration policy](https://github.com/Nick2bad4u/ncu-config-nick2bad4u/blob/main/docs/CONFIGURATION.md) for the complete contract and [the maintenance checklist](https://github.com/Nick2bad4u/ncu-config-nick2bad4u/blob/main/docs/UPDATE_CHECKLIST.md) when updating NCU or changing the published policy.

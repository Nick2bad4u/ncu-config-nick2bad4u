# Configuration Policy

This package publishes two npm-check-updates (NCU) presets with one shared dependency-update policy:

- `.ncurc.json` targets an ordinary package and sets `workspaces: false`.
- `.ncurc.workspaces.json` targets npm workspaces and sets `workspaces: true` plus `root: true`.

The files intentionally differ only where workspace traversal requires it. Tests compare their shared options so a policy change cannot silently drift between them.

## Dependency selection

Both presets inspect production, development, optional, and `packageManager` declarations. They target the `latest` dist-tag, exclude prereleases, preserve declared version-range operators, and include deprecated packages in the report.

TypeScript is temporarily present in the shared `reject` list. This freezes the `typescript` declaration in every consumer, including TypeScript 6 patch and minor updates, until the shared toolchain supports TypeScript 7. That broader freeze is intentional: NCU JSON files cannot express a package-aware version predicate, and a `rejectVersion` pattern for version 7 would incorrectly affect every package.

## Update and install behavior

Interactive mode and `upgrade: true` allow NCU to write selected changes to package manifests. `install: "never"` keeps dependency installation separate, so consumers can review the manifest diff before running their package manager.

The presets use the public npm registry, eight concurrent requests, three retries, a one-minute release cooldown, and a 60-minute metadata cache.

## Workspace traversal

The workspace preset includes both the root manifest and declared npm workspaces. It keeps `deep: false` because NCU does not allow deep package-file discovery and workspace traversal together.

`mergeConfig: true` enables NCU's root-config merging behavior when a consumer explicitly selects deep or package-file discovery. It is not needed to make npm workspace traversal inherit the shared preset.

## Config discovery and overrides

`configFileName` and `configFilePath` are discovery controls, not reusable rc-file policy. Consumers pass both flags in their package script so NCU loads the preset directly from `node_modules/ncu-config-nick2bad4u`.

CLI flags take precedence over the loaded preset. That is useful for a one-off read-only check, for example:

```bash
ncu --configFileName .ncurc.json --configFilePath node_modules/ncu-config-nick2bad4u --no-interactive --no-upgrade
```

Do not copy the shared file into a consuming repository. Changing the published package and updating its version is what keeps policy synchronized across repositories.

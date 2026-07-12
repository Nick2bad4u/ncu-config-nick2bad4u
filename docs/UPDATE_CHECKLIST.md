# NCU Config Update Checklist

Use this checklist when updating npm-check-updates or changing either shared preset.

## Config behavior

- [ ] Compare new options and defaults with the installed NCU help, `RcOptions`, and JSON schema.
- [ ] Keep config discovery flags out of the published rc files.
- [ ] Confirm `.ncurc.json` keeps `workspaces: false`.
- [ ] Confirm `.ncurc.workspaces.json` keeps `workspaces: true`, `root: true`, and `deep: false`.
- [ ] Keep shared values identical between the presets unless the difference is workspace-specific.
- [ ] Review every entry in `reject`, document why it is held back, and cover it in both CLI fixtures.
- [ ] Check that doctor/install commands are portable npm commands rather than repository-specific scripts.

## Package and consumers

- [ ] Keep both dotfiles in `package.json#files` and `package.json#exports`.
- [ ] Keep the npm-check-updates peer range aligned with the oldest version verified by tests.
- [ ] Update the typed paths/loaders and README when a preset is renamed.
- [ ] Keep `docs/CONFIGURATION.md` aligned with the exact published policy.
- [ ] Run the standard and workspace CLI fixture tests without network access or manifest mutation.
- [ ] Run `npm pack --dry-run --json` and confirm both presets and built declarations are included.

## Release

- [ ] Run `npm run release:verify`.
- [ ] Confirm CI, security checks, Codecov, and any configured quality gates pass for the release commit.
- [ ] Decide semver from the published config behavior and public package API.
- [ ] Verify the installed npm artifact can load and execute both presets from `node_modules`.

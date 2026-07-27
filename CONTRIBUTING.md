# Contributing

## Setup

```bash
npm ci
npm run build
```

npm 12 reads the reviewed lifecycle-script policy from `package.json#allowScripts`.
Run project installs normally; do not pass `--allow-scripts`, which npm rejects
for project-scoped installs.

## Before Opening A Pull Request

```bash
npm run lint:all
npm run typecheck
npm run test
npm run package:check
```

Changes to either NCU preset must keep the typed loader, README examples, and real CLI consumer tests aligned. Verify new options against the installed npm-check-updates schema rather than copying undocumented flags.

Use the commit style documented in `.github/agent-commit-message-instructions.md`.

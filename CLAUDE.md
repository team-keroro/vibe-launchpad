# vibe-launchpad repository rules

## Release every change

Every change to the plugin follows these steps. Do all steps; do not stop after the merge.

1. Increase the version in `.claude-plugin/plugin.json` and in both places in `.claude-plugin/marketplace.json`. If the version does not change, the installed plugin does not update.
2. Add an entry to `CHANGELOG.md`.
3. Open a PR to `main` and merge it.
4. Run `./scripts/sync-installed.sh`. It updates the plugin that is installed on this computer and verifies that the installed version is the same as `main`.
5. Report the installed version to the owner. Tell the owner that the change loads in a new session.

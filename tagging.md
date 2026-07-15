# Git Tagging

This document defines EZ-MEAL release tag policy and commands.

Use `WORKFLOW.md` for the full development and release process. This file focuses only on version alignment and Git tags.

## Tag Policy

- Tags use the format `vX.Y.Z`, for example `v1.2.0`.
- Tags must be created from stable commits on `main`.
- A tag must match the version stored in `package.json` and `app.json`.
- Published release tags should be treated as immutable.
- Do not create release tags from feature, fix, release candidate or APK workflow branches.
- `release/<version>` branches may contain the version bump, but the official tag is created only after that branch is verified and merged into `main`.

## Version Alignment

Before tagging a release, bump the shared app version:

```bash
npm run version:bump -- <version>
```

This updates:

- `package.json`
- `package-lock.json`
- `app.json > expo.version`
- `app.json > expo.android.versionCode`
- `app.json > expo.ios.buildNumber`

Commit the version bump before creating the tag.

## Create a Local Tag

```bash
npm run version:tag
```

The script reads the current version from the project files and creates the matching local annotated tag.

## Push a Tag

Preferred command:

```bash
npm run version:tag:push
```

Manual equivalent:

```bash
git push origin vX.Y.Z
```

## Verify a Remote Tag

```bash
git ls-remote --tags origin vX.Y.Z
```

## Script Safeguards

The tag scripts fail if:

- `package.json` and `app.json` versions differ;
- `package-lock.json` is not aligned;
- Android or iOS build numbers are missing or invalid;
- the working tree is not clean;
- the local tag already exists and points to a different commit;
- the remote tag already exists when using `version:tag:push`.

## Manual Recovery

Use manual commands only when the scripts are unavailable or a deliberate recovery is needed.

Delete a wrong local tag:

```bash
git tag -d vX.Y.Z
```

Delete a wrong remote tag:

```bash
git push origin :refs/tags/vX.Y.Z
```

Only delete tags intentionally and after checking whether they were already used for a public build or release.

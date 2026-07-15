# Development and Release Workflow

This document describes the current EZ-MEAL workflow for development, versioning, tagging and Android APK builds.

## Principles

- `main` is the stable source of truth.
- Tags `vX.Y.Z` must be created only from stable commits on `main`.
- Development branches start from `main` and are merged back only after checks.
- `android-apk` is a technical branch used only to trigger the EAS APK workflow.
- Do not develop directly on `android-apk`.

## Current Branches

| Branch | Purpose |
| --- | --- |
| `main` | Stable state, official versions and tags. |
| `android-apk` | Triggers EAS workflow for installable Android APKs. |
| `feature/*`, `task/*`, `fix/*` | Temporary development branches from `main`. |

## 1. Start Development

```bash
git checkout main
git pull
git checkout -b feature/work-name
```

Examples:

```bash
git checkout -b feature/new-logo
git checkout -b task/multi-recipe-slots
git checkout -b fix/today-weekday
```

## 2. Work on the Branch

Run checks while developing:

```bash
npm run typecheck
npm run test
```

If Expo config, assets or icons changed:

```bash
npx expo config --type public
```

Commit the work:

```bash
git status
git add .
git commit -m "describe change"
```

## 3. Merge Back to Main

```bash
git checkout main
git pull
git merge feature/work-name
npm run typecheck
npm run test
npx expo config --type public
git push origin main
```

## 4. Prepare a Release

On `main`, bump version and build numbers:

```bash
npm run version:bump -- 1.2.1
```

Run checks:

```bash
npm run typecheck
npm run test
npx expo config --type public
```

Commit the release:

```bash
git status
git add package.json package-lock.json app.json README.md tagging.md WORKFLOW.md scripts
git commit -m "release: bump version"
git push origin main
```

## 5. Tag the Release

Create the local annotated tag from the current version:

```bash
npm run version:tag
```

Push it:

```bash
npm run version:tag:push
```

Or use the manual command printed by `version:tag`, for example:

```bash
git push origin v1.2.1
```

Verify:

```bash
git ls-remote --tags origin v1.2.1
```

## 6. Build an Installable Android APK

After `main` is stable, pushed and tagged:

```bash
git checkout android-apk
git pull
git merge main
git push origin android-apk
```

The push to `android-apk` starts the EAS workflow that produces an installable APK.

## Rules

- Do not tag from feature branches.
- Do not tag before committing the version bump.
- Do not develop on `android-apk`.
- Do not treat `android-apk` as a stable branch; stability belongs to `main`.
- If a tag already exists and points to the wrong commit, stop and decide deliberately before deleting or recreating it.
- Every APK build should be traceable to a version on `main`.

## Future

The following branches/workflows are not part of the active process yet.

### `store-release`

Possible future branch for store builds:

- Android Play Store: AAB through EAS production profile.
- iOS App Store/TestFlight: iOS production build.

Expected flow:

```bash
git checkout store-release
git pull
git merge main
git push origin store-release
```

### Platform-Specific Store Branches

Possible future alternatives:

```text
android-store
ios-store
```

Not needed yet.

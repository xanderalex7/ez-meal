# Development and Release Workflow

This document defines how EZ-MEAL development, release preparation, Android APK builds and web deployment are managed.

Tag-specific commands and validation rules live in `tagging.md`. This file only describes when tagging happens in the broader workflow.

## Principles

- `main` is the last verified stable release.
- Development happens on short-lived branches created from `main`.
- Release candidates are prepared on `release/<version>` branches before reaching `main`.
- Tags are created only from `main` after the release candidate has been verified.
- GitHub Pages deploys the web app from `main` only.
- `android-apk` is a technical branch used only to trigger installable Android APK builds.
- Do not develop directly on `android-apk`.
- Keep generated files and private credentials out of Git.

## Branches

| Branch | Purpose |
| --- | --- |
| `main` | Last verified stable release and official tags. |
| `release/<version>` | Release candidate branch used for version bump, fixes and APK validation before merging to `main`. |
| `android-apk` | Technical branch that receives a release candidate and triggers the EAS APK workflow. |
| GitHub Pages workflow | Deploys the web build from `main` after stable changes are promoted. |
| `feature/*`, `task/*`, `fix/*` | Temporary development branches from `main`. |

## Standard Development Flow

1. Start from an updated `main`.
2. Create a short-lived branch for the change.
3. Implement the change and update relevant docs.
4. Run local checks.
5. Merge finished work into the appropriate release candidate when preparing a release.
6. Keep `main` untouched until the release candidate is verified.

Recommended local checks:

```bash
npm run typecheck
npm run test
```

If Expo config, assets, icons or build settings changed, also verify:

```bash
npx expo config --type public
```

## Release Flow

1. Start from updated `main`.
2. Create `release/<version>`, for example `release/1.3.1`.
3. Merge or implement the release changes on `release/<version>`.
4. Bump the app version and native build numbers on `release/<version>`.
5. Run the required local checks.
6. Commit the release candidate.
7. Build and smoke-test the release candidate through the pipeline branch.
8. If the candidate is broken, fix it on `release/<version>` and rebuild.
9. When the candidate is verified, merge `release/<version>` into `main`.
10. Create and push the official release tag from `main` using `tagging.md`.
11. Deploy the web app to GitHub Pages from `main`.

Version bump command:

```bash
npm run version:bump -- <version>
```

The command keeps these files aligned:

- `package.json`
- `package-lock.json`
- `app.json > expo.version`
- `app.json > expo.android.versionCode`
- `app.json > expo.ios.buildNumber`

The public app version should stay stable for the release candidate, for example `1.3.1`. If multiple APK candidates are needed before the release is accepted, keep `expo.version` as `1.3.1` and increment only the native build numbers when required.

Example:

| Candidate | App version | Android `versionCode` | iOS `buildNumber` | Outcome |
| --- | --- | --- | --- | --- |
| First APK | `1.3.1` | `13` | `13` | Broken, discarded. |
| Second APK | `1.3.1` | `14` | `14` | Verified, promoted to `main`. |

The Git history should then expose public release tags as `v1.3.0 -> v1.3.1`, not skip to `v1.3.2` just because an internal candidate failed.

## Android APK Flow

Use this flow only when an installable APK is needed.

1. Confirm `release/<version>` contains the candidate to test.
2. Merge `release/<version>` into `android-apk`.
3. Push `android-apk`.
4. Wait for the EAS workflow to produce the APK.
5. Install and smoke-test the APK.

The workflow file is `.eas/workflows/android-apk.yml`.

Do not apply direct fixes on `android-apk`. If the APK is broken, fix `release/<version>`, then merge the release branch into `android-apk` again.

## Promotion to Main

After the release candidate passes smoke testing:

1. Switch to `main`.
2. Merge `release/<version>`.
3. Run the final checks.
4. Push `main`.
5. Create and push the tag from `main`.

At this point `main` represents the verified release.

## GitHub Pages Web Deploy

Use this flow only after the release candidate has been promoted to `main`.

1. Confirm `main` contains the verified release.
2. Confirm the official release tag has been created and pushed when the change is a release.
3. Run the web export from `main`.
4. Deploy the generated web build to GitHub Pages.
5. Smoke-test the published URL.

The expected web export command is:

```bash
npm run build:web
```

The generated output is:

```text
build/web
```

GitHub Pages should expose only stable `main` content. Do not deploy directly from feature, fix, release candidate or `android-apk` branches.

When the GitHub Pages workflow is implemented, it should:

- use Node.js 26;
- install dependencies with the lockfile;
- run the web build;
- publish `build/web`;
- avoid committing generated build output to the repository.

The workflow file is `.github/workflows/github-pages.yml`.

## Release Smoke Test

Before considering a release complete, verify at least:

- app launch;
- ingredient create/delete;
- recipe create/edit/delete;
- plan create/edit/save/delete;
- multiple recipes in one meal slot;
- Today view based on weekday;
- theme and language selection;
- CSV export/import;
- web app from GitHub Pages when web deployment is enabled;
- local database reset;
- app data after close/reopen.

## Future Workflows

The following workflows are not active yet.

| Future branch/workflow | Purpose |
| --- | --- |
| `store-release` | Possible unified branch for App Store/TestFlight and Play Store builds. |
| `android-store` | Possible Android store-specific release branch. |
| `ios-store` | Possible iOS store-specific release branch. |

When store workflows are introduced, this document should become the source of truth for the active branch strategy.

# EZ-MEAL

Offline-first app to plan breakfast, lunch and dinner from available recipes and ingredients.

## Stack

- React Native + Expo SDK 54
- TypeScript
- Targets: Android, iOS and web
- Local persistence with SQLite

## Prerequisites

- Node.js 26.x and npm. Older versions, such as Node 18, can break Metro with `configs.toReversed is not a function`.
- Android Studio, Android SDK and either an emulator or a physical Android device for Android development.
- macOS with Xcode for iOS development.
- Expo Go for quick development testing on a physical device.

If using `nvm`:

```bash
nvm install 26
nvm use 26
node -v
```

`node -v` should print a `v26.x.x` version.

## Setup

```bash
npm install
```

## Development

Start Expo:

```bash
npm run start
```

Useful alternatives:

```bash
npm run start:offline
npm run start:offline:clear
npm run web
npm run ios
npm run android
```

Use offline start if Expo Go reports `UnexpectedServerData: Unexpected server error: No returned query result`.

## Local Checks

```bash
npm run typecheck
npm run test
npm audit --omit=dev
```

If the change affects Expo config, assets or app icons:

```bash
npx expo config --type public
```

## Release Versioning

Update npm, Expo, Android and iOS versions together:

```bash
npm run version:bump -- 1.2.1
```

The command updates:

- `package.json`
- `package-lock.json`
- `app.json > expo.version`
- `app.json > expo.android.versionCode`
- `app.json > expo.ios.buildNumber`

Create the local Git tag from the current version:

```bash
npm run version:tag
```

Push the tag:

```bash
npm run version:tag:push
```

Or push manually with the command printed by `version:tag`, for example:

```bash
git push origin v1.2.1
```

See `tagging.md` and `WORKFLOW.md` for the full release flow.

## Build / Export

Local exports are generated in `build/`:

```bash
npm run build:android
npm run build:ios
npm run build:web
```

Expected outputs:

- `build/android/`: Android export bundle.
- `build/ios/`: iOS export bundle.
- `build/web/`: static web/PWA export.

`build/` is generated output and is ignored by Git.

To create an installable Android APK through EAS:

```bash
npx eas-cli@latest build -p android --profile apk
```

The repository also includes `.eas/workflows/android-apk.yml`: pushing to `android-apk` triggers the APK build workflow.

## Project Structure

- `App.tsx`: app shell and root UI.
- `index.ts`: Expo entry point.
- `src/domain/`: pure domain types and rules.
- `src/data/`: SQLite persistence, repositories, mappers and migrations.
- `src/features/`: feature screens and application model.
- `src/shared/`: shared UI, theme, i18n, logging and utilities.
- `src/test/`: tests, fixtures and builders.
- `assets/`: logo and app icon assets.
- `docs/`: requirements, architecture, design, security and tasks.
- `IMPORT_EXPORT.md`: single-CSV import/export format.
- `WORKFLOW.md`: development, release, tagging and APK workflow.

## Current Capabilities

- Local recipe and ingredient management.
- Weekly meal plans with named/selectable plans.
- Multiple recipes per meal slot.
- Random meal plan draft generation.
- Today view based on weekday, not absolute calendar date.
- Light/dark/system theme preference.
- Italian/English UI language preference.
- Local SQLite persistence.
- CSV import/export for ingredients, recipes, meal plans, language and theme.
- Local database reset from settings.
- PWA-ready web export.
- Android APK workflow through EAS.

## Public Repository Notes

- No secrets are expected in the repository.
- `.env`, `.env.*`, `.expo/`, `build/`, native build folders and private key/certificate formats are ignored.
- Do not commit EAS credentials, keystores, Apple certificates, API tokens or private environment files.

# Git Tagging Cheatsheet

## Recommended EZ-MEAL Flow

Use npm scripts to avoid version mismatches.

1. Bump version and build numbers:

```bash
npm run version:bump -- 1.2.1
```

2. Run checks:

```bash
npm run typecheck
npm run test
npx expo config --type public
```

3. Commit the release:

```bash
git status
git add package.json package-lock.json app.json README.md tagging.md WORKFLOW.md scripts
git commit -m "release: bump version"
```

4. Create the local tag:

```bash
npm run version:tag
```

5. Push the tag:

```bash
npm run version:tag:push
```

Or push manually:

```bash
git push origin v1.2.1
```

6. Verify the remote tag:

```bash
git ls-remote --tags origin v1.2.1
```

## Script Checks

`npm run version:tag` and `npm run version:tag:push` fail if:

- `package.json` and `app.json` versions differ;
- `package-lock.json` is not aligned;
- `android.versionCode` or `ios.buildNumber` are missing or invalid;
- the working tree is not clean;
- the local tag already exists and points to a different commit;
- the remote tag already exists during `version:tag:push`.

## Manual Tagging

Use manual tagging only if the scripts are unavailable.

```bash
git tag -a v1.2.1 -m "Release v1.2.1"
git push origin v1.2.1
git ls-remote --tags origin v1.2.1
```

Delete a wrong local tag:

```bash
git tag -d v1.2.1
```

Delete a wrong remote tag:

```bash
git push origin :refs/tags/v1.2.1
```

Only delete tags intentionally; published release tags should normally be immutable.

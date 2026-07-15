const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const nextVersion = process.argv[2];
const shouldIncrementBuild = !process.argv.includes('--no-build-increment');

if (!nextVersion || nextVersion.startsWith('-')) {
  fail('Uso: npm run version:bump -- <x.y.z> [--no-build-increment]');
}

if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(nextVersion)) {
  fail(`Versione non valida: ${nextVersion}. Usa il formato semver x.y.z.`);
}

const packageJsonPath = path.join(rootDir, 'package.json');
const packageLockPath = path.join(rootDir, 'package-lock.json');
const appJsonPath = path.join(rootDir, 'app.json');

const packageJson = readJson(packageJsonPath);
const packageLock = readJson(packageLockPath);
const appJson = readJson(appJsonPath);

if (!appJson.expo) {
  fail('app.json non contiene la chiave expo.');
}

const previousPackageVersion = packageJson.version;
const previousAppVersion = appJson.expo.version;
const previousAndroidVersionCode = appJson.expo.android?.versionCode;
const previousIosBuildNumber = appJson.expo.ios?.buildNumber;

packageJson.version = nextVersion;

if (packageLock.version !== undefined) {
  packageLock.version = nextVersion;
}
if (packageLock.packages?.['']) {
  packageLock.packages[''].version = nextVersion;
}

appJson.expo.version = nextVersion;
appJson.expo.android = appJson.expo.android ?? {};
appJson.expo.ios = appJson.expo.ios ?? {};

if (shouldIncrementBuild) {
  appJson.expo.android.versionCode = incrementNumber(previousAndroidVersionCode);
  appJson.expo.ios.buildNumber = String(incrementNumber(previousIosBuildNumber));
} else {
  appJson.expo.android.versionCode = normalizeNumber(previousAndroidVersionCode);
  appJson.expo.ios.buildNumber = String(normalizeNumber(previousIosBuildNumber));
}

writeJson(packageJsonPath, packageJson);
writeJson(packageLockPath, packageLock);
writeJson(appJsonPath, appJson);

console.log('Versione aggiornata:');
console.log(`- package.json: ${previousPackageVersion ?? 'n/d'} -> ${packageJson.version}`);
console.log(`- app.json expo.version: ${previousAppVersion ?? 'n/d'} -> ${appJson.expo.version}`);
console.log(
  `- android.versionCode: ${previousAndroidVersionCode ?? 'n/d'} -> ${appJson.expo.android.versionCode}`,
);
console.log(`- ios.buildNumber: ${previousIosBuildNumber ?? 'n/d'} -> ${appJson.expo.ios.buildNumber}`);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function normalizeNumber(value) {
  if (value === undefined || value === null || value === '') {
    return 1;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    fail(`Build number non valido: ${value}`);
  }
  return parsed;
}

function incrementNumber(value) {
  return normalizeNumber(value) + 1;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

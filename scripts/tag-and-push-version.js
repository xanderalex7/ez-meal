const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');
const shouldPush = process.argv.includes('--push');

const packageJson = readJson(path.join(rootDir, 'package.json'));
const packageLock = readJson(path.join(rootDir, 'package-lock.json'));
const appJson = readJson(path.join(rootDir, 'app.json'));

const packageVersion = packageJson.version;
const packageLockVersion = packageLock.packages?.['']?.version ?? packageLock.version;
const appVersion = appJson.expo?.version;
const androidVersionCode = appJson.expo?.android?.versionCode;
const iosBuildNumber = appJson.expo?.ios?.buildNumber;

if (!isSemver(packageVersion)) {
  fail(`package.json contiene una versione non valida: ${packageVersion}`);
}
if (packageVersion !== appVersion) {
  fail(`Versioni non allineate: package.json=${packageVersion}, app.json=${appVersion}`);
}
if (packageLockVersion !== packageVersion) {
  fail(`package-lock.json non allineato: ${packageLockVersion} invece di ${packageVersion}`);
}
if (!Number.isInteger(androidVersionCode) || androidVersionCode < 1) {
  fail(`android.versionCode non valido: ${androidVersionCode}`);
}
if (!iosBuildNumber || !Number.isInteger(Number(iosBuildNumber)) || Number(iosBuildNumber) < 1) {
  fail(`ios.buildNumber non valido: ${iosBuildNumber}`);
}

const tagName = `v${packageVersion}`;

const status = git(['status', '--porcelain']);
if (status.trim()) {
  if (dryRun) {
    console.log('Dry run: working tree non pulita, il comando reale si fermerebbe qui.');
  } else {
    fail('Working tree non pulita. Commit o stash delle modifiche prima di creare il tag.');
  }
}

const localTags = git(['tag', '--list', tagName]).trim();
if (localTags) {
  const headCommit = git(['rev-parse', 'HEAD']).trim();
  const tagCommit = git(['rev-parse', `${tagName}^{}`]).trim();
  if (headCommit !== tagCommit) {
    fail(`Il tag locale ${tagName} esiste gia ma punta a un commit diverso da HEAD.`);
  }
  console.log(`Il tag locale ${tagName} esiste gia e punta a HEAD: verra riusato.`);
}

if (shouldPush && !dryRun) {
  const remoteTags = git(['ls-remote', '--tags', 'origin', tagName]).trim();
  if (remoteTags) {
    fail(`Il tag remoto ${tagName} esiste gia su origin.`);
  }
}

console.log(`Versione pronta per tag: ${packageVersion}`);
console.log(`Tag: ${tagName}`);
console.log(`Android versionCode: ${androidVersionCode}`);
console.log(`iOS buildNumber: ${iosBuildNumber}`);

if (dryRun) {
  console.log('Dry run: nessun tag creato e nessun push eseguito.');
  process.exit(0);
}

if (!localTags) {
  git(['tag', '-a', tagName, '-m', `Release ${tagName}`], { stdio: 'inherit' });
}

if (shouldPush) {
  git(['push', 'origin', tagName], { stdio: 'inherit' });
  console.log(`Tag ${tagName} pushato su origin.`);
} else {
  console.log(`Tag locale ${tagName} pronto.`);
  console.log('Per pushare manualmente:');
  console.log(`git push origin ${tagName}`);
  console.log('Oppure:');
  console.log('npm run version:tag:push');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function git(args, options = {}) {
  return execFileSync('git', args, {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
  });
}

function isSemver(value) {
  return /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

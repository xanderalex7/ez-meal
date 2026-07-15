const fs = require('fs');
const path = require('path');

const outputDir = path.resolve(__dirname, '..', 'build', 'web');

function assertOutputDir() {
  if (!fs.existsSync(outputDir)) {
    throw new Error('Missing build/web. Run npm run build:web first.');
  }
}

function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

function patchTextFile(filePath) {
  const textExtensions = new Set(['.html', '.js', '.json', '.webmanifest', '.css']);
  if (!textExtensions.has(path.extname(filePath))) {
    return;
  }

  const original = fs.readFileSync(filePath, 'utf8');
  let next = original
    .replaceAll('"/_expo/', '"./_expo/')
    .replaceAll("'/_expo/", "'./_expo/")
    .replaceAll('"/assets/', '"./assets/')
    .replaceAll("'/assets/", "'./assets/")
    .replaceAll('"/icons/', '"./icons/')
    .replaceAll("'/icons/", "'./icons/")
    .replaceAll('"/favicon.ico', '"./favicon.ico')
    .replaceAll("'/favicon.ico", "'./favicon.ico")
    .replaceAll('"/manifest.webmanifest', '"./manifest.webmanifest')
    .replaceAll("'/manifest.webmanifest", "'./manifest.webmanifest")
    .replaceAll('"/service-worker.js', '"./service-worker.js')
    .replaceAll("'/service-worker.js", "'./service-worker.js")
    .replaceAll('"/index.html', '"./index.html')
    .replaceAll("'/index.html", "'./index.html");

  if (path.basename(filePath) === 'manifest.webmanifest') {
    const manifest = JSON.parse(next);
    manifest.start_url = './';
    manifest.scope = './';
    if (Array.isArray(manifest.icons)) {
      manifest.icons = manifest.icons.map((icon) => ({
        ...icon,
        src: typeof icon.src === 'string' ? icon.src.replace(/^\//, './') : icon.src,
      }));
    }
    next = `${JSON.stringify(manifest, null, 2)}\n`;
  }

  if (path.basename(filePath) === 'service-worker.js') {
    next = next.replace("['/',", "['./',");
  }

  if (next !== original) {
    fs.writeFileSync(filePath, next);
  }
}

assertOutputDir();
for (const file of listFiles(outputDir)) {
  patchTextFile(file);
}

fs.writeFileSync(path.join(outputDir, '.nojekyll'), '');
console.log('Prepared build/web for GitHub Pages.');

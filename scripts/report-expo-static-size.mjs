import { readFile, readdir, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { extname, relative, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? 'apps/app/dist');
const compressibleExtensions = new Set(['.css', '.html', '.js', '.json', '.mjs', '.svg', '.txt', '.xml']);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(path)));
    else if (entry.isFile()) files.push(path);
  }

  return files;
}

function sum(items, key) {
  return items.reduce((total, item) => total + item[key], 0);
}

async function inspectFile(path) {
  const fileStat = await stat(path);
  const extension = extname(path).toLowerCase();
  let gzipBytes = null;

  if (compressibleExtensions.has(extension)) {
    const contents = await readFile(path);
    gzipBytes = gzipSync(contents, { level: 9 }).length;
  }

  return {
    path: relative(root, path).replaceAll('\\', '/'),
    extension: extension || '[none]',
    bytes: fileStat.size,
    gzipBytes,
  };
}

let rootStat;
try {
  rootStat = await stat(root);
} catch {
  throw new Error(`Expo static export not found at ${root}. Run npm run export:web first.`);
}

if (!rootStat.isDirectory()) throw new Error(`Expected Expo static export directory at ${root}.`);

const inspected = await Promise.all((await collectFiles(root)).map(inspectFile));
const javascript = inspected.filter((file) => file.extension === '.js' || file.extension === '.mjs');
const styles = inspected.filter((file) => file.extension === '.css');
const compressible = inspected.filter((file) => file.gzipBytes !== null);
const largest = [...inspected]
  .sort((left, right) => right.bytes - left.bytes)
  .slice(0, 15)
  .map(({ path, bytes, gzipBytes }) => ({ path, bytes, gzipBytes }));

const report = {
  root,
  fileCount: inspected.length,
  totalBytes: sum(inspected, 'bytes'),
  javascriptBytes: sum(javascript, 'bytes'),
  javascriptGzipBytes: javascript.reduce((total, file) => total + (file.gzipBytes ?? 0), 0),
  cssBytes: sum(styles, 'bytes'),
  cssGzipBytes: styles.reduce((total, file) => total + (file.gzipBytes ?? 0), 0),
  compressibleGzipBytes: compressible.reduce((total, file) => total + (file.gzipBytes ?? 0), 0),
  largestFiles: largest,
};

console.log('MIZAN production Web static-export size report');
console.log(JSON.stringify(report, null, 2));

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = resolve(process.argv[2] ?? 'apps/app/dist');
const port = Number(process.argv[3] ?? process.env.PORT ?? 8092);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid port: ${process.argv[3] ?? process.env.PORT ?? ''}`);
}

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.avif', 'image/avif'],
  ['.ico', 'image/x-icon'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.ttf', 'font/ttf'],
  ['.otf', 'font/otf'],
  ['.wasm', 'application/wasm'],
]);

function resolveInsideRoot(relativePath) {
  const candidate = resolve(root, relativePath);
  if (candidate === root || candidate.startsWith(`${root}${sep}`)) return candidate;
  return null;
}

async function resolveExportedFile(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return { error: 400 };
  }

  const relative = decoded.replace(/^\/+/, '');
  const candidates = relative
    ? [relative, `${relative}.html`, `${relative}/index.html`]
    : ['index.html'];

  for (const candidate of candidates) {
    const filePath = resolveInsideRoot(candidate);
    if (!filePath) return { error: 403 };
    try {
      const fileStat = await stat(filePath);
      if (fileStat.isFile()) return { filePath };
    } catch {
      // Try the next static-export route shape.
    }
  }

  return { error: 404 };
}

const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { 'content-type': 'text/plain; charset=utf-8', allow: 'GET, HEAD' });
    response.end('Method Not Allowed');
    return;
  }

  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? '127.0.0.1'}`);
  const resolved = await resolveExportedFile(url.pathname);
  if (!('filePath' in resolved)) {
    const status = resolved.error;
    response.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' });
    response.end(status === 404 ? 'Not Found' : 'Invalid request');
    return;
  }

  try {
    const body = await readFile(resolved.filePath);
    const contentType = contentTypes.get(extname(resolved.filePath).toLowerCase()) ?? 'application/octet-stream';
    response.writeHead(200, {
      'content-type': contentType,
      'content-length': body.length,
      'cache-control': 'no-store',
    });
    if (request.method === 'HEAD') response.end();
    else response.end(body);
  } catch (error) {
    console.error('Static export server failed to read a resolved file.', error);
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Internal Server Error');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving Expo static export from ${root} at http://127.0.0.1:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}

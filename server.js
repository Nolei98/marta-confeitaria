import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 2888;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.dc.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(urlPath);
  } catch (e) {
    decodedPath = urlPath;
  }

  let safePath = path.normalize(decodedPath).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  let filePath = path.join(__dirname, safePath);

  if (!fs.existsSync(filePath)) {
    if (fs.existsSync(filePath + '.dc.html')) {
      filePath += '.dc.html';
    } else if (fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>404 - Não encontrado</title></head><body style="font-family:sans-serif;text-align:center;padding:50px"><h1>404 - Página não encontrada</h1><p><a href="/">Voltar para o início</a></p></body></html>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('\n---------------------------------------------------');
  console.log(`🍰 Marta Confeitaria rodando localmente!`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`🌐 IP:    http://127.0.0.1:${PORT}`);
  console.log('---------------------------------------------------\n');
});

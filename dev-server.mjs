// 로컬 확인용 서버. Vercel에는 올라가지 않는다(.vercelignore).
// SHEET_WEBHOOK_URL이 없으면 시트로 보내지 않고 받은 응답을 터미널에 찍기만 한다.
//   node dev-server.mjs            → http://127.0.0.1:4174
//   SHEET_WEBHOOK_URL=… FORM_SECRET=… node dev-server.mjs  → 실제 시트까지 확인

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import handler from './api/submit.js';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4174);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };

http.createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);

  if (path === '/api/submit') {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    const body = raw ? JSON.parse(raw) : null;
    if (!process.env.SHEET_WEBHOOK_URL) {
      console.log('[mock submit]', JSON.stringify(body, null, 2));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true, mock: true }));
    }
    // Vercel의 req/res 도우미(status, json)를 흉내 낸다
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (o) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); return res; };
    req.body = body;
    return handler(req, res);
  }

  const file = normalize(join(ROOT, path === '/' ? 'index.html' : path));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('not found');
  }
}).listen(PORT, '127.0.0.1', () => console.log(`http://127.0.0.1:${PORT}`));

// Минимальный статический сервер для превью. Поддерживает --host и --port.
const http = require('http');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
function arg(name, dflt) {
  const i = args.indexOf('--' + name);
  if (i !== -1 && args[i + 1]) return args[i + 1];
  const m = args.find(a => a.startsWith('--' + name + '='));
  if (m) return m.split('=')[1];
  return dflt;
}
const HOST = arg('host', '127.0.0.1');
const PORT = parseInt(arg('port', '7100'), 10);
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.json': 'application/json; charset=utf-8'
};

// Заголовки безопасности для всех ответов
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    // sha256 — встроенный блок JSON-LD в index.html; пересчитать при его изменении
    "script-src 'self' 'sha256-mZm8BAycyeVloNmecZ2bP2db/lE80MDEHPDRejUuAV4='",
    // 'unsafe-inline' нужен для style-атрибутов декоративной SVG-графики
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self'",
    "connect-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ')
};

http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(req.url.split('?')[0]);
  } catch (e) {
    res.writeHead(400, Object.assign({ 'Content-Type': 'text/plain; charset=utf-8' }, SECURITY_HEADERS));
    return res.end('Некорректный запрос');
  }
  if (urlPath === '/') urlPath = '/index.html';

  // Защита от выхода за пределы корня сайта (path traversal)
  const file = path.resolve(ROOT, '.' + urlPath);
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) {
    res.writeHead(403, Object.assign({ 'Content-Type': 'text/plain; charset=utf-8' }, SECURITY_HEADERS));
    return res.end('Forbidden');
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, Object.assign({ 'Content-Type': 'text/plain; charset=utf-8' }, SECURITY_HEADERS));
      return res.end('Не найдено: ' + urlPath);
    }
    res.writeHead(200, Object.assign({ 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' }, SECURITY_HEADERS));
    res.end(data);
  });
}).listen(PORT, HOST, () => {
  console.log(`Гараж №1 — превью: http://${HOST}:${PORT}/`);
});

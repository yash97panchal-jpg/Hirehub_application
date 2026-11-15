const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8443;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json'
};

function resolveFile(urlPath) {
  let cleanPath = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  if (cleanPath === '' || cleanPath === '/') {
    cleanPath = '/index.html';
  }

  // 1. Direct match in ROOT
  let filePath = path.join(ROOT, cleanPath);
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    if (stat.isFile()) return filePath;
    if (stat.isDirectory()) {
      const idx = path.join(filePath, 'index.html');
      if (fs.existsSync(idx)) return idx;
    }
  }

  // 2. Match inside "Job Portal Web App"
  let webAppPath = path.join(ROOT, 'Job Portal Web App', cleanPath);
  if (fs.existsSync(webAppPath)) {
    const stat = fs.statSync(webAppPath);
    if (stat.isFile()) return webAppPath;
    if (stat.isDirectory()) {
      const idx = path.join(webAppPath, 'index.html');
      if (fs.existsSync(idx)) return idx;
    }
  }

  // 3. Match inside "Job Portal Web App/dist"
  let distPath = path.join(ROOT, 'Job Portal Web App', 'dist', cleanPath);
  if (fs.existsSync(distPath) && fs.statSync(distPath).isFile()) {
    return distPath;
  }

  // 4. Match inside "Job Portal Web App/public"
  let pubPath = path.join(ROOT, 'Job Portal Web App', 'public', cleanPath);
  if (fs.existsSync(pubPath) && fs.statSync(pubPath).isFile()) {
    return pubPath;
  }

  // 5. SPA Fallback: if route has no extension or is html, fallback to /index.html
  const ext = path.extname(cleanPath);
  if (!ext || ext === '.html') {
    return path.join(ROOT, 'index.html');
  }

  return null;
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const resolved = resolveFile(req.url);
  if (!resolved || !fs.existsSync(resolved)) {
    console.log(`[404] ${req.method} ${req.url} (not found)`);
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!doctype html><html><head><title>404 Not Found</title></head><body style="font-family:sans-serif;padding:40px;text-align:center"><h1>404 Not Found</h1><p>Requested: ${req.url}</p><p><a href="/#/">Go to HireHub Home</a></p></body></html>`);
    return;
  }

  const ext = path.extname(resolved).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(resolved, (err, data) => {
    if (err) {
      console.log(`[500] ${req.method} ${req.url} -> ${err.message}`);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }
    console.log(`[200] ${req.method} ${req.url} -> ${resolved} (${data.length} bytes)`);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': data.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  console.log(`====================================================`);
  console.log(`HireHub Professional Server running`);
  console.log(`Local URL:   http://localhost:${PORT}/`);
  ips.forEach(ip => {
    console.log(`Network URL (Phone): http://${ip}:${PORT}/`);
  });
  console.log(`====================================================`);
});

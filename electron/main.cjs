const { app, BrowserWindow, shell } = require('electron');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const MIME_TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.geojson', 'application/geo+json; charset=utf-8'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
]);

let staticServer = null;
let staticServerUrlPromise = null;

function getStaticServerUrl() {
  if (!staticServerUrlPromise) staticServerUrlPromise = startStaticServer();
  return staticServerUrlPromise;
}

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(handleStaticRequest);

    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      staticServer = server;
      resolve(`http://127.0.0.1:${address.port}/`);
    });
  });
}

function handleStaticRequest(request, response) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method Not Allowed');
    return;
  }

  let pathname;
  try {
    const requestUrl = new URL(request.url, 'http://127.0.0.1/');
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    response.writeHead(400);
    response.end('Bad Request');
    return;
  }

  if (pathname === '/') pathname = '/index.html';

  const requestedPath = path.resolve(ROOT_DIR, `.${pathname}`);
  const relativePath = path.relative(ROOT_DIR, requestedPath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.stat(requestedPath, (statError, stats) => {
    if (statError) {
      response.writeHead(404);
      response.end('Not Found');
      return;
    }

    if (stats.isDirectory()) {
      serveFile(path.join(requestedPath, 'index.html'), request, response);
      return;
    }

    serveFile(requestedPath, request, response);
  });
}

function serveFile(filePath, request, response) {
  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      response.writeHead(404);
      response.end('Not Found');
      return;
    }

    const contentType = MIME_TYPES.get(path.extname(filePath).toLowerCase()) ?? 'application/octet-stream';
    response.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
    });

    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    fs.createReadStream(filePath)
      .on('error', () => {
        if (!response.headersSent) response.writeHead(500);
        response.end('Internal Server Error');
      })
      .pipe(response);
  });
}

async function createWindow() {
  const startUrl = await getStaticServerUrl();
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 620,
    backgroundColor: '#f8f8f6',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(startUrl)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  await mainWindow.loadURL(startUrl);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('before-quit', () => {
  if (staticServer) staticServer.close();
});

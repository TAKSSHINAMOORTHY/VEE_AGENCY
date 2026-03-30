const { app, BrowserWindow, shell } = require('electron');
const fs = require('fs');
const path = require('path');

function resolveIndexFile() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'web-dist', 'index.html');
  }

  const localPackagedWeb = path.join(__dirname, 'web-dist', 'index.html');
  if (fs.existsSync(localPackagedWeb)) {
    return localPackagedWeb;
  }

  return path.join(__dirname, '..', 'dist', 'index.html');
}

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  const indexFile = resolveIndexFile();
  if (fs.existsSync(indexFile)) {
    win.loadFile(indexFile);
  } else {
    win.loadURL(
      `data:text/html,${encodeURIComponent(
        '<h2>Build not found</h2><p>Run "npm run prepare:web" inside windows folder first.</p>',
      )}`,
    );
  }
}

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const { app, BrowserWindow, ipcMain, dialog, globalShortcut, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

// Data storage path
const userDataPath = app.getPath('userData');
const dataFile = path.join(userDataPath, 'soundboard-data.json');
const soundsDir = path.join(userDataPath, 'sounds');

let mainWindow;
let tray = null;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 780,
    minWidth: 800,
    minHeight: 500,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'icon.png')
  });

  mainWindow.loadFile('index.html');

  // Minimize to tray instead of closing
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ===== SYSTEM TRAY =====
function createTray() {
  // Create a simple colored icon (16x16 purple square)
  // In production, use a proper .ico/.png file
  const iconPath = path.join(__dirname, 'icon.png');
  let trayIcon;
  
  if (fs.existsSync(iconPath)) {
    trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  } else {
    // Fallback: create a simple icon programmatically
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('SoundBoard by suyfoo — Running in background');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show SoundBoard',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: 'Stop All Sounds',
      click: () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('global-stop-all');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit SoundBoard',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  // Double-click tray icon to show window
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// Ensure sounds directory exists
function ensureDirs() {
  if (!fs.existsSync(soundsDir)) fs.mkdirSync(soundsDir, { recursive: true });
}

// ===== IPC Handlers =====

// Window controls
ipcMain.on('win-minimize', () => mainWindow?.minimize());
ipcMain.on('win-maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
// Close now hides to tray
ipcMain.on('win-close', () => {
  if (mainWindow) mainWindow.hide();
});

// Open file dialog for audio files
ipcMain.handle('open-audio-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Add Sounds',
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'webm', 'm4a', 'flac', 'aac'] }
    ],
    properties: ['openFile', 'multiSelections']
  });
  if (result.canceled) return [];
  return result.filePaths;
});

// Copy audio file to app storage and return new path
ipcMain.handle('import-sound', async (e, srcPath) => {
  ensureDirs();
  const ext = path.extname(srcPath);
  const id = 'snd_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  const destName = id + ext;
  const destPath = path.join(soundsDir, destName);
  fs.copyFileSync(srcPath, destPath);
  
  const name = path.basename(srcPath, ext).replace(/[-_]/g, ' ');
  return {
    id,
    fileName: destName,
    filePath: destPath,
    originalName: name.charAt(0).toUpperCase() + name.slice(1)
  };
});

// Get stored sound file path
ipcMain.handle('get-sound-path', (e, fileName) => {
  return path.join(soundsDir, fileName);
});

// Save state
ipcMain.handle('save-state', async (e, data) => {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
  return true;
});

// Load state
ipcMain.handle('load-state', async () => {
  try {
    if (fs.existsSync(dataFile)) {
      return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    }
  } catch (err) { console.error('Load error:', err); }
  return null;
});

// Delete sound file
ipcMain.handle('delete-sound-file', async (e, fileName) => {
  const filePath = path.join(soundsDir, fileName);
  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch(err) {}
  return true;
});

// ===== IMPORT / EXPORT =====
ipcMain.handle('export-soundboard', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export SoundBoard',
    defaultPath: 'soundboard-backup.json',
    filters: [{ name: 'SoundBoard Backup', extensions: ['json'] }]
  });
  if (result.canceled) return false;

  try {
    const stateRaw = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')) : {};
    const exportData = { ...stateRaw, _soundFiles: {} };

    // Embed each sound file as base64
    for (const sound of (stateRaw.sounds || [])) {
      if (sound.fileName) {
        const fp = path.join(soundsDir, sound.fileName);
        if (fs.existsSync(fp)) {
          exportData._soundFiles[sound.fileName] = fs.readFileSync(fp).toString('base64');
        }
      }
    }

    fs.writeFileSync(result.filePath, JSON.stringify(exportData), 'utf8');
    return true;
  } catch (err) {
    console.error('Export error:', err);
    return false;
  }
});

ipcMain.handle('import-soundboard', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Import SoundBoard',
    filters: [{ name: 'SoundBoard Backup', extensions: ['json'] }],
    properties: ['openFile']
  });
  if (result.canceled || !result.filePaths[0]) return null;

  try {
    const raw = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf8'));
    const soundFiles = raw._soundFiles || {};
    delete raw._soundFiles;

    ensureDirs();
    // Write each sound file from base64
    for (const [fileName, b64] of Object.entries(soundFiles)) {
      const destPath = path.join(soundsDir, fileName);
      if (!fs.existsSync(destPath)) {
        fs.writeFileSync(destPath, Buffer.from(b64, 'base64'));
      }
    }

    // Save state
    fs.writeFileSync(dataFile, JSON.stringify(raw, null, 2), 'utf8');
    return raw;
  } catch (err) {
    console.error('Import error:', err);
    return null;
  }
});

// ===== GLOBAL SHORTCUTS =====
let registeredShortcuts = new Set();

ipcMain.handle('register-global-shortcut', (e, accelerator, soundId) => {
  try {
    if (registeredShortcuts.has(accelerator)) {
      globalShortcut.unregister(accelerator);
      registeredShortcuts.delete(accelerator);
    }

    const success = globalShortcut.register(accelerator, () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('global-shortcut-triggered', soundId);
      }
    });

    if (success) registeredShortcuts.add(accelerator);
    return success;
  } catch (err) {
    console.error(`Failed to register shortcut "${accelerator}":`, err.message);
    return false;
  }
});

ipcMain.handle('unregister-global-shortcut', (e, accelerator) => {
  try {
    if (registeredShortcuts.has(accelerator)) {
      globalShortcut.unregister(accelerator);
      registeredShortcuts.delete(accelerator);
    }
    return true;
  } catch (err) { return false; }
});

ipcMain.handle('unregister-all-shortcuts', () => {
  globalShortcut.unregisterAll();
  registeredShortcuts.clear();
  return true;
});

ipcMain.handle('register-stop-all-shortcut', (e, accelerator) => {
  try {
    if (registeredShortcuts.has(accelerator)) {
      globalShortcut.unregister(accelerator);
      registeredShortcuts.delete(accelerator);
    }
    const success = globalShortcut.register(accelerator, () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('global-stop-all');
      }
    });
    if (success) registeredShortcuts.add(accelerator);
    return success;
  } catch (err) { return false; }
});

// ===== APP LIFECYCLE =====
app.whenReady().then(() => {
  createTray();
  createWindow();
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  // Don't quit — tray keeps it alive
});

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  } else {
    createWindow();
  }
});

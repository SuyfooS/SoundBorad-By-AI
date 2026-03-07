const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.send('win-minimize'),
  maximize: () => ipcRenderer.send('win-maximize'),
  close: () => ipcRenderer.send('win-close'),

  // File operations
  openAudioFiles: () => ipcRenderer.invoke('open-audio-files'),
  importSound: (filePath) => ipcRenderer.invoke('import-sound', filePath),
  getSoundPath: (fileName) => ipcRenderer.invoke('get-sound-path', fileName),
  deleteSoundFile: (fileName) => ipcRenderer.invoke('delete-sound-file', fileName),

  // State persistence
  saveState: (data) => ipcRenderer.invoke('save-state', data),
  loadState: () => ipcRenderer.invoke('load-state'),

  // Global shortcuts
  registerGlobalShortcut: (accelerator, soundId) => ipcRenderer.invoke('register-global-shortcut', accelerator, soundId),
  unregisterGlobalShortcut: (accelerator) => ipcRenderer.invoke('unregister-global-shortcut', accelerator),
  unregisterAllShortcuts: () => ipcRenderer.invoke('unregister-all-shortcuts'),
  registerStopAllShortcut: (accelerator) => ipcRenderer.invoke('register-stop-all-shortcut', accelerator),

  // Listen for global shortcut triggers from main process
  onGlobalShortcutTriggered: (callback) => ipcRenderer.on('global-shortcut-triggered', (e, soundId) => callback(soundId)),
  onGlobalStopAll: (callback) => ipcRenderer.on('global-stop-all', () => callback()),

  // Import / Export
  exportSoundboard: () => ipcRenderer.invoke('export-soundboard'),
  importSoundboard: () => ipcRenderer.invoke('import-soundboard'),
});

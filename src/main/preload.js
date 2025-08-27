const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded');

contextBridge.exposeInMainWorld('electronAPI', {
  selectParquetFile: () => ipcRenderer.invoke('select-parquet-file'),
  readFileBuffer: (filePath) => ipcRenderer.invoke('read-file-buffer', filePath)
});

console.log('electronAPI exposed to main world');
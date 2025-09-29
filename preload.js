const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  chooseFolder: () => ipcRenderer.invoke('choose-folder'),
    saveToFolder: (folderPath, fileName, content) =>
    ipcRenderer.invoke('save-to-folder', folderPath, fileName, content)
});
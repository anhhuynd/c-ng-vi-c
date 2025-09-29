const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

const isDev = process.env.NODE_ENV !== 'production';




function createWindow() {
  const win = new BrowserWindow({
    // width: 1000,
    // height: 700,
     fullscreen: true,
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });


  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
    // win.webContents.openDevTools();
  }
  

  
// win.webContents.openDevTools();

}

app.whenReady().then(createWindow);

ipcMain.handle('choose-folder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: "Chọn thư mục lưu",
    properties: ['openDirectory']
  });

  if (!canceled && filePaths.length > 0) {
    return filePaths[0]; // Trả về path của folder
  }
  return null;
});

// Lưu file vào folder đã chọn
ipcMain.handle('save-to-folder', async (event, folderPath, fileName, content) => {
  try {
    const filePath = path.join(folderPath, fileName);
    fs.writeFileSync(filePath, Buffer.from(content)); // Chuyển Uint8Array thành Buffer
    return { success: true, path: filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});



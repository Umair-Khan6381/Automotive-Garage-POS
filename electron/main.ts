import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'Private Automotive Garage POS & Workshop Management',
    backgroundColor: '#F5F5F3',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  // Load production build or local dev server
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Print Handler for Invoices and Job Cards
ipcMain.handle('print-to-pdf', async (_event, options) => {
  if (!mainWindow) return { success: false, error: 'Window not active' };
  try {
    const pdfData = await mainWindow.webContents.printToPDF(options || {
      marginsType: 0,
      printBackground: true,
      pageSize: 'A4'
    });
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Invoice PDF',
      defaultPath: `invoice_${Date.now()}.pdf`,
      filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
    });
    if (filePath) {
      const fs = require('fs');
      fs.writeFileSync(filePath, pdfData);
      return { success: true, filePath };
    }
    return { success: false, cancelled: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('print-direct', async () => {
  if (!mainWindow) return;
  mainWindow.webContents.print({ silent: false, printBackground: true });
});

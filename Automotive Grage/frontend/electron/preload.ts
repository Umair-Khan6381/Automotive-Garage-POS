import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  printToPdf: (options?: any) => ipcRenderer.invoke('print-to-pdf', options),
  printDirect: () => ipcRenderer.invoke('print-direct')
});

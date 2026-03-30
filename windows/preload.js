const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('veeAgencyDesktop', {
  platform: process.platform,
  versions: process.versions,
});

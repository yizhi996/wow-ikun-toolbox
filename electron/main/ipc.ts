import { app, dialog, ipcMain, shell } from 'electron'
import { IPCChannel, isMacOS } from '~shared'

ipcMain.handle(IPCChannel.CHOOSE_WOW_DIR, async event => {
  const res = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (!res.canceled && res.filePaths.length) {
    const file = res.filePaths[0]
    return file
  }
})

ipcMain.handle(IPCChannel.CHOOSE_BATTLENET_DIR, async event => {
  const res = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Battle.net', extensions: isMacOS() ? ['app'] : ['exe'] }]
  })
  if (!res.canceled && res.filePaths.length) {
    const file = res.filePaths[0]
    return file
  }
})

ipcMain.handle(IPCChannel.GET_APP_INFO, () => {
  return {
    paths: {
      appData: app.getPath('appData'),
      userData: app.getPath('userData')
    },
    version: app.getVersion()
  }
})

ipcMain.on(IPCChannel.OPEN_DEV_TOOLS, event => {
  event.sender.openDevTools()
})

ipcMain.on(IPCChannel.RELOAD_APP, event => {
  event.sender.reload()
})

ipcMain.handle(IPCChannel.SHOW_IN_FOLDER, (event, path) => {
  shell.showItemInFolder(path)
})

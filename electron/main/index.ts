import { app, BrowserWindow, shell, ipcMain, dialog, nativeTheme, Menu, net } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import { config, save } from './storage'

const DOMAIN = ['https://plashspeed.top/', 'https://d4ok.com/']

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

let domain = config.domain || DOMAIN[0]
if (!DOMAIN.includes(domain)) {
  domain = DOMAIN[0]
}

async function createWindow() {
  if (process.platform === 'win32') {
    Menu.setApplicationMenu(null)
  }

  nativeTheme.themeSource = 'dark'

  win = new BrowserWindow({
    title: '魔兽世界奥金工具箱',
    width: config.bounds.width,
    height: config.bounds.height,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  win.on('close', () => {
    config.bounds = win.getBounds()
    save()
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    // electron-vite-vue#298
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadURL(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}

app.whenReady().then(() => {
  app.configureHostResolver({
    secureDnsMode: 'automatic',
    secureDnsServers: ['https://doh.pub/dns-query']
  })
  createWindow()
})

app.on('before-quit', () => {
  win.removeAllListeners('close')
  win.close()
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

ipcMain.handle('choose-wow-root-dir', async event => {
  const res = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (!res.canceled && res.filePaths.length) {
    const file = res.filePaths[0]
    return file
  }
})

ipcMain.handle('get-app-info', () => {
  return {
    paths: {
      appData: app.getPath('appData'),
      userData: app.getPath('userData')
    },
    version: app.getVersion()
  }
})

ipcMain.on('open-dev-tools', event => {
  event.sender.openDevTools()
})

ipcMain.on('reload-app', async event => {
  win.reload()
})

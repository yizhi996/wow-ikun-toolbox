import { ipcRenderer } from 'electron'

export function getStorage<T>(key: string) {
  return ipcRenderer.invoke('app-storage-get', key) as Promise<T>
}

export function setStorage(key: string, value: any) {
  return ipcRenderer.invoke('app-storage-set', key, value)
}

export function removeStorage(key: string) {
  return ipcRenderer.invoke('app-storage-remove', key)
}

export function clearStorage() {
  return ipcRenderer.invoke('app-storage-clear')
}

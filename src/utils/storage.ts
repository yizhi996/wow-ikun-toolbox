import { ipcRenderer } from 'electron'
import { IPCChannel } from '~shared'

export function getStorage<T>(key: string) {
  return ipcRenderer.invoke(IPCChannel.STORAGE_GET, key) as Promise<T>
}

export function setStorage(key: string, value: any) {
  return ipcRenderer.invoke(IPCChannel.STORAGE_SET, key, value)
}

export function removeStorage(key: string) {
  return ipcRenderer.invoke(IPCChannel.STORAGE_REMOVE, key)
}

export function clearStorage() {
  return ipcRenderer.invoke(IPCChannel.STORAGE_CLEAR)
}

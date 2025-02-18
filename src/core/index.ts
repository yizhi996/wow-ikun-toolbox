import { useStore } from '~/store'
import { resolve, dirname, join } from 'node:path'
import { existsSync, lstatSync } from 'node:fs'
import { cp, rm, stat, mkdir, readdir } from 'node:fs/promises'
import dayjs from 'dayjs'

export async function backupLocalAllData() {
  const store = useStore()
  if (!store.checkWoWExists()) {
    return
  }

  if (store.localBackupLimit > 0) {
    const dest = store.BACKUP_PATH
    const backups = (await readdir(dest)).filter(f => f.startsWith('备份_')).map(f => join(dest, f))
    backups.sort((a, b) => {
      return lstatSync(a).ctimeMs - lstatSync(b).ctimeMs
    })
    if (backups.length > store.localBackupLimit) {
      for await (const f of backups.slice(0, backups.length - store.localBackupLimit)) {
        lstatSync(f).isDirectory() ? await rm(f, { recursive: true, force: true }) : await rm(f)
      }
    }
  }

  const filename = `备份_${dayjs(new Date()).format('YYYY-MM-DD HHmmss')}`
  const dest = join(store.BACKUP_PATH, filename)
  await mkdir(dest)

  const interfaceDir = store.INTERFACE_PATH
  if (existsSync(interfaceDir)) {
    await cp(interfaceDir, join(dest, 'Interface'), { recursive: true })
  }

  const wtfDir = store.WTF_PATH
  if (existsSync(wtfDir)) {
    await cp(wtfDir, join(dest, 'WTF'), { recursive: true })
  }

  const fontDir = store.FONTS_PATH
  if (existsSync(fontDir)) {
    await cp(fontDir, join(dest, 'Fonts'), { recursive: true })
  }
}

export const clearWDB = async () => {
  const store = useStore()
  if (!store.checkWoWExists()) {
    return
  }
  const root = dirname(store.wowRootDir)
  let dir = join(root, 'WDB')
  await rm(dir, { recursive: true, force: true })

  dir = join(root, 'Cache')
  await rm(dir, { recursive: true, force: true })

  dir = join(root, 'CPUCache')
  await rm(dir, { recursive: true, force: true })

  // dir = join(root, 'Errors')
  // await rm(dir, { recursive: true, force: true })
}

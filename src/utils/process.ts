import { exec } from 'node:child_process'

export const quitProcess = (name: string) => {
  const isWin = process.platform === 'win32'
  const cmd = isWin ? `taskkill /f /im ${name}.exe` : `pkill -9 ${name}`
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject(error)
      }
      if (stderr) {
        return reject(stderr)
      }
      resolve(stdout)
    })
  })
}

export const checkProcessIsRunning = (name: string) => {
  const isWin = process.platform === 'win32'
  const cmd = isWin ? `tasklist /fi "imagename eq ${name}.exe" /fo csv` : `ps aux`
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject(error)
      }
      if (stderr) {
        return reject(stderr)
      }
      resolve(stdout.includes(isWin ? `${name}.exe` : `${name}.app`))
    })
  })
}

import { checkWoWExists, getAccountPath } from '~/utils/path'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { fs_readdir } from '~/utils/fs'
import { Flavor } from '../wtf'
import { parseLua } from '~/utils/lua'
import { isArray, isString } from '~/utils'

const FILENAME_SAVED_VARIABLES = 'SavedVariables'

export const parseMyslotText = (text: string) => {
  const ERR_INVALID = '不是正确的 Myslot 文本'

  const KEY_MYSLOE = '# Myslot'
  const KEY_MYSLOT_END = '# END OF MYSLOT'
  const KEY_TIME = '# 时间: '
  const KEY_NAME = '# 玩家: '
  const KEY_CLASS = '# 职业: '
  const KEY_TALENT = '# 专精: '

  if (!isString(text)) {
    throw new Error(ERR_INVALID)
  }

  const lines = text.split('\n')
  if (!lines[0].startsWith(KEY_MYSLOE)) {
    throw new Error(ERR_INVALID)
  }
  if (!lines[lines.length - 1].startsWith(KEY_MYSLOT_END)) {
    throw new Error(ERR_INVALID)
  }
  let i = lines.findIndex(line => line.startsWith(KEY_TIME))
  if (i === -1) {
    throw new Error(ERR_INVALID)
  }
  const time = lines[i].substring(KEY_TIME.length)

  i = lines.findIndex(line => line.startsWith(KEY_NAME))
  if (i === -1) {
    throw new Error(ERR_INVALID)
  }
  const name = lines[i].substring(KEY_NAME.length)

  i = lines.findIndex(line => line.startsWith(KEY_CLASS))
  if (i === -1) {
    throw new Error(ERR_INVALID)
  }
  const classes = lines[i].substring(KEY_CLASS.length)

  i = lines.findIndex(line => line.startsWith(KEY_TALENT))
  if (i === -1) {
    throw new Error(ERR_INVALID)
  }

  const talent = lines[i].substring(KEY_TALENT.length)

  return {
    name,
    classes,
    talent,
    createAt: new Date(time).getTime() / 1000
  }
}

export const loadWTFMyslots = async (flavor: Flavor | string) => {
  if (!checkWoWExists()) {
    return []
  }

  const root = getAccountPath(flavor)
  if (!existsSync(root)) {
    return []
  }

  const accounts = await fs_readdir(root)
  const result: ({ text: string } & ReturnType<typeof parseMyslotText>)[] = []

  for await (const account of accounts) {
    const filePath = resolve(root, account, FILENAME_SAVED_VARIABLES, 'Myslot.lua')
    if (existsSync(filePath)) {
      const lua = await readFile(filePath, { encoding: 'utf-8' })
      try {
        const luaObj = parseLua(lua)
        if (luaObj && luaObj.MyslotExports) {
          if (isArray(luaObj.MyslotExports.exports)) {
            luaObj.MyslotExports.exports.forEach((item: any) => {
              const value = item.value as string
              if (result.findIndex(e => e.text === value) === -1) {
                result.push({
                  text: value,
                  ...parseMyslotText(value)
                })
              }
            })
          }
        }
      } catch (e) {
        console.log(e)
      }
    }
  }

  result.sort((a, b) => b.createAt - a.createAt)
  return result
}

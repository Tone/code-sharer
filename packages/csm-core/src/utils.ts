import crypto from 'crypto'
import fs from 'fs-extra'
import path from 'path'

const HASH = crypto.createHash('sha256')

interface Style {
  match: string
  key: string
  hash?: number
}

export interface Key {
  [key: string]: string
}

export function parse(style: string): Style[] {
  const keyArr = style.match(/(?<=\[)[a-z]+(:-?\d)?(?=\])/g)
  if (keyArr === null) return []

  return keyArr.map((keyItem) => {
    const [key, hash] = keyItem.split(':')
    const match = `[${keyItem}]`
    return hash !== undefined ? { key, hash: +hash, match } : { key, match }
  })
}

export function stringify(style: string, key: Key): string {
  let name = style
  const match = parse(style)

  match.forEach((m) => {
    const val = key[m.key]
    const hash =
      m.hash !== undefined
        ? HASH.copy().update(val).digest('hex').slice(0, m.hash)
        : ''
    const str = hash !== '' ? hash : val
    name = name.replace(m.match, str)
  })

  return name
}

export function allFiles(dir: string) {
  const files: string[] = []

  function readdir(dir: string) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((file) => {
      if (file.isFile()) {
        files.push(path.join(dir, file.name))
        return
      }
      readdir(path.join(dir, file.name))
    })
  }
  readdir(dir)
  return files
}

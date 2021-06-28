import path from 'path'
import fs from 'fs-extra'
import fg from 'fast-glob'
import Git from 'simple-git/promise'
import Config from './config'
export { default as download } from './download'

export const config = new Config()

export async function filesByGlob(patterns: string[], cwd = process.cwd()) {
  return await fg(patterns, { cwd })
}

export async function copyByGlob(patterns: string[], dest: string, { cwd = process.cwd() }) {
  const files = await filesByGlob(patterns, cwd)

  return files.reduce((source: string[], file) => {
    const srcFile = path.join(cwd, file)
    const destFile = path.join(dest, file)

    if (fs.statSync(srcFile).isFile()) {
      fs.copySync(srcFile, destFile)
      source.push(destFile)
    }

    return source
  }, [])
}

export async function gitInit(dir: string) {
  return await Git(dir).init()
}

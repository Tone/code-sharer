import path from 'path'
import fs from 'fs-extra'
import os from 'os'
import fg from 'fast-glob'

export { default as download } from './download'

export const DEFAULT_TEMPLATE_URL =
  'git@github.com:Tone/code-sharer.git#simple/packages/csm-template-vue'

export const DEFAULT_CONFIG_FILE = 'package.json'

export const CONFIG_FILED = 'csmConfig'

export const DEFAULT_STORAGE_URL = 'git@github.com:Tone/csm-storage.git'

export const CONF_FILE = path.resolve(os.homedir(), '.csm.conf')

interface Iconfig {
  storage: string[]
  template: string[]
  [key: string]: any
}

class Config {
  file: string
  config: Iconfig
  constructor(file = CONF_FILE) {
    if (!fs.existsSync(file)) {
      fs.outputJSONSync(file, {
        storage: [DEFAULT_STORAGE_URL],
        template: [DEFAULT_TEMPLATE_URL]
      })
    }
    this.file = file
    this.config = fs.readJSONSync(file)
  }

  add(key: string, val: string) {
    this.config[key].push(val)
    this.write()
    return this.config[key]
  }

  remove(key: string, val: string) {
    const index = this.config[key].indexOf(val)
    if (index !== -1) this.config[key].splice(index, 1)
    this.write()
    return this.config[key]
  }

  search(key: string) {
    return this.config[key]
  }

  write() {
    fs.outputJSONSync(this.file, this.config)
  }
}

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

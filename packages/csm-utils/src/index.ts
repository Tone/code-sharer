import path from 'path'
import fs from 'fs-extra'
import os from 'os'
import glob from 'glob'

export { default as download } from './download'

export const DEFAULT_TEMPLATE_URL =
  'https://github.com/Tone/code-sharer/tree/simple/packages/csm-template-vue'

export const DEFAULT_CONFIG_FILE = 'package.json'

export const CONFIG_FILED = 'csmConfig'

export const DEFAULT_STORAGE_URL = 'git@github.com:Tone/csm-storage.git'

export function parseConfig(dir = process.cwd()) {
  const configFile = path.join(dir, DEFAULT_CONFIG_FILE)
  if (!fs.existsSync(configFile)) return null
  return fs.readJSONSync(configFile)[CONFIG_FILED] ?? null
}

export const CONF_FILE = path.resolve(os.homedir(), '.csm.conf')

interface Iconfig {
  storage: string[]
  template: Array<{ name: string; dir: string }>
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
  }

  remove(key: string, val: string) {
    const index = this.config[key].indexOf(val)
    if (index !== -1) this.config[key].splice(index, 1)
    this.write()
  }

  search(key: string) {
    return this.config[key]
  }

  write() {
    fs.outputFileSync(this.file, this.config)
  }
}

export const config = new Config()

export function files(patterns: string[]) {
  const globPatterns =
    patterns.length > 1 ? '{' + patterns.join(',') + '}' : patterns[0]
  return glob.sync(globPatterns)
}

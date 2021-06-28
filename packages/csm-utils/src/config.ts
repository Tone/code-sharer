import fs from 'fs-extra'
import os from 'os'
import path from 'path'

const DEFAULT_TEMPLATE_URL = ''
const DEFAULT_STORAGE_URL = ''
const CONF_FILE = path.resolve(os.homedir(), '.csm.conf')

interface Iconfig {
  storage: string[]
  template: string[]
  [key: string]: any
}

export default class Config {
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

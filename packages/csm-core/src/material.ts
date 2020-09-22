import path from 'path'
import fs from 'fs-extra'

import Storage from './storage'
import Template from './template'
import {
  DEFAULT_CONFIG_FILE,
  CONFIG_FILED,
  SOURCE_DIR
} from './constant'

interface MaterialInfo {
  name: string
  category: string
  description: string
  keywords: string[]
  code?: string
  dependencies: string[],
  files: string[]
}

export default class Material {
  static async init(
    repo: string
  ) {
    const storage = await Storage.init(repo)
    return new Material(storage)
  }

  private readonly storage: Storage
  log: Map<string, MaterialInfo>

  constructor(storage: Storage) {
    this.storage = storage
    this.log = this.count()
  }

  async create(template: Template, dir: string) {
    fs.ensureDirSync(dir)
    return await template.init(dir)
  }

  async checkExist(name: string) {
    await this.storage.fetch()
    return fs.existsSync(path.join(this.storage.dir, name))
  }

  async publish(files: string[], info: MaterialInfo) {
    if (await this.checkExist(info.name)) {
        throw new Error(`${info.name} already exists
      `)
    }
    const commitHash = await this.storage.commit(files, `Add ${info.name}`)
    await this.storage.push(commitHash)
  }

  search(name: string, tag: string) {
    return Array.from(this.log.values()).filter(
      (info) =>
        info.name.includes(name) && info.keywords.some((t) => t.includes(tag))
    )
  }

  async download(name: string, target: string) {
    const srcDir = path.join(this.storage.dir, name, SOURCE_DIR)
    const targetDir = path.join(target, name)
    return await fs.copy(srcDir, targetDir)
  }

  count() {
    const storageDir = this.storage.dir
    const dirs = fs.readdirSync(storageDir)
    const log: Map<string, MaterialInfo> = new Map()

    return dirs.reduce((log, dir) => {
      log.set(dir, this.parse(dir))
      return log
    }, log)
  }

  parse(dir: string): MaterialInfo {
    const info = fs.readJSONSync(path.join(dir, DEFAULT_CONFIG_FILE))
    const { name, description, keywords, dependencies, files } = info

    return {
      name,
      category: info[CONFIG_FILED]?.category,
      description,
      dependencies,
      keywords,
      code: info[CONFIG_FILED]?.code,
      files
    }
  }

  format(info: MaterialInfo) {
    return `Material Info:
    name: ${info.name}
    category: ${info.category}
    description: ${info.description}
    keywords:${info.keywords.join(',')}
    files:${info.files.join(',')}
    code: ${info.code}
    dependencies: ${info.dependencies.join(' ')}`
  }

  config(dir: string) {
    const configFile = path.join(dir, DEFAULT_CONFIG_FILE)
    if (!fs.existsSync(configFile)) return null
    return fs.readJSONSync(configFile)[CONFIG_FILED] ?? null
  }

  async update() {
    const curHead = await this.storage.head()
    const remoteHead = await (await this.storage.fetch()).head()

    if (curHead !== remoteHead) {
      await this.storage.pull()
      this.log = this.count()
    }
  }

  updateLog(name: string, info: MaterialInfo) {
    this.log.set(name, info)
  }

  has(name: string) {
    return this.log.has(name)
  }
}

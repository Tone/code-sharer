import path from 'path'
import fs from 'fs-extra'

import Storage from './storage'
import Template from './template'
import {
  DEFAULT_MATERIAL_CONFIG_NAME,
  SOURCE_DIR,
  DEFAULT_BRANCH,
  WIP_BRANCH
} from './constant'

interface Dependencies {
  name: string
  version: string
}

interface MaterialInfo {
  name: string
  description: string
  tags: string[]
  code?: string
  dep: Dependencies[]
}

interface MaterialConfig {
  stable: string
  beta: string
}

export default class Material {
  static async init(
    dir: string,
    url?: string,
    config: MaterialConfig = { stable: DEFAULT_BRANCH, beta: WIP_BRANCH }
  ) {
    const storage = await Storage.init(dir, config.stable, url)
    return new Material(storage, config)
  }

  private readonly storage: Storage
  private readonly config: MaterialConfig
  log: Map<string, MaterialInfo>

  constructor(storage: Storage, config: MaterialConfig) {
    this.storage = storage
    this.config = config
    this.log = this.count()
  }

  async create(template: Template, dir: string) {
    fs.ensureDirSync(dir)
    return await template.init(dir)
  }

  async checkExist(name: string, rest = true) {
    await this.storage.fetch()
    await this.storage.branch(this.config.beta)
    const exist = fs.existsSync(path.join(this.storage.dir, name))
    if (rest) {
      await this.storage.branch(this.config.stable)
    }
    return exist
  }

  async publish(files: string[], info: MaterialInfo) {
    await this.storage.fetch()
    await this.storage.branch(this.config.beta)

    try {
      if (await this.checkExist(info.name, false)) {
        throw new Error(`${info.name} already exists
      `)
      }
      const commitHash = await this.storage.commit(files, `Add ${info.name}`)
      await this.storage.push(commitHash, undefined, this.config.beta)
    } finally {
      await this.storage.branch(this.config.stable)
    }
  }

  search(name: string, tag: string) {
    return Array.from(this.log.values()).filter(
      (info) =>
        info.name.includes(name) && info.tags.some((t) => t.includes(tag))
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
    const infoFile = path.join(dir, DEFAULT_MATERIAL_CONFIG_NAME)
    return fs.readJSONSync(infoFile)
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

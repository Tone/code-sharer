import path from 'path'
import fs from 'fs-extra'
import { copyByGlob } from '@tone./csm-utils'

import Storage from './storage'
import {
  DEFAULT_CONFIG_FILE,
  CONFIG_FILED
} from './constant'

interface Template {
  init(dir: string): Promise<any>
}

interface MaterialInfo {
  name: string
  category: string
  description: string
  keywords: string[]
  code?: string
  dependencies: Record<string, string>,
  files: string[]
}

interface MaterialConfig {
  categories: Record<string, string>,
  templateUrl: string
}

enum SearchKey {
  NAME,
  KEYWORDS,
  ALL
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

  async create<T extends Template>(template: T, dir: string) {
    if (await this.checkExist(dir)) throw new Error(`${dir} already exists`)
    try {
      return await template.init(dir)
    } catch (e) {
      fs.removeSync(dir)
      throw e
    }
  }

  async checkExist(dir: string) {
    await this.storage.fetch()
    return fs.existsSync(path.join(this.storage.dir, dir))
  }

  async publish(info: MaterialInfo) {
    const commitHash = await this.storage.commit(['.'], `Add ${info.category}/${info.name}`)
    if (commitHash !== '') {
      await this.storage.push(commitHash)
    }
  }

  search(str: string, searchKey = SearchKey.ALL) {
    return Array.from(this.log.values()).filter(
      ({ name, keywords }) => {
        switch (searchKey) {
          case SearchKey.ALL:
            return name.includes(str) || keywords.some((t) => t.includes(str))
          case SearchKey.KEYWORDS:
            return keywords.some((t) => t.includes(str))
          case SearchKey.NAME:
            return name.includes(str)
        }
      }
    )
  }

  async download(info: MaterialInfo, target: string) {
    const srcDir = path.join(this.storage.dir, info.category, info.name)
    const targetDir = path.join(target, info.name)

    return await copyByGlob(info.files, targetDir, { cwd: srcDir })
  }

  dirs() {
    const storageDir = this.storage.dir
    const config = this.config(storageDir)
    if (config?.categories === undefined) throw new Error('storage config parse error, not find categories')

    return Object.keys(config.categories).reduce((dirs: string[], dir) => {
      const categoryDir = path.join(storageDir, dir)
      if (!fs.existsSync(categoryDir)) return dirs
      const subDir = fs.readdirSync(categoryDir).map(sub => path.join(dir, sub))
      return [...dirs, ...subDir]
    }, [])
  }

  count() {
    const dirs = this.dirs()
    const log: Map<string, MaterialInfo> = new Map()

    return dirs.reduce((log, dir) => {
      const info = this.parse(path.join(this.storage.dir, dir))
      if (info === null) return log
      log.set(dir, info)
      return log
    }, log)
  }

  parse(dir: string): MaterialInfo | null {
    if (!fs.existsSync(path.join(dir, DEFAULT_CONFIG_FILE))) return null
    const info = fs.readJSONSync(path.join(dir, DEFAULT_CONFIG_FILE))
    const { name, description = '', keywords = [], dependencies = {}, files = [] } = info

    return {
      name,
      category: info[CONFIG_FILED].category,
      description,
      dependencies,
      keywords,
      code: info[CONFIG_FILED]?.code ?? '',
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
    dependencies: ${Object.keys(info.dependencies).map(dep => `${dep}@${info.dependencies[dep]}`).join(' ')}`
  }

  config(dir: string): MaterialConfig {
    const configFile = path.join(dir, DEFAULT_CONFIG_FILE)
    if (!fs.existsSync(configFile) || fs.readJSONSync(configFile)[CONFIG_FILED] === undefined) throw new Error(`${dir} is not a storage`)
    return fs.readJSONSync(configFile)[CONFIG_FILED]
  }

  async update() {
    const curHead = await this.storage.head()
    const remoteHead = await (await this.storage.fetch()).head()

    if (curHead !== remoteHead) {
      await this.storage.pull()
      this.log = this.count()
    }
  }

  updateLog(info: MaterialInfo) {
    this.log.set(path.join(info.category, info.name), info)
  }

  has(info: MaterialInfo) {
    return this.log.has(path.join(info.category, name))
  }

  find(category: string, name: string) {
    return this.log.get(path.join(category, name)) ?? null
  }
}

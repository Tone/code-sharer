import path from 'path'
import fs from 'fs-extra'
import { files } from '@tone./csm-utils'

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
  dependencies: string[],
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
    fs.ensureDirSync(dir)
    return await template.init(dir)
  }

  async checkExist(dir: string) {
    await this.storage.fetch()
    return fs.existsSync(path.join(this.storage.dir, dir))
  }

  async publish(info: MaterialInfo) {
    if (await this.checkExist(path.join(info.category, info.name))) {
        throw new Error(`${info.name} already exists
      `)
    }
    const commitFiles = files([`${info.category}/${info.name}/**/*`])
    const commitHash = await this.storage.commit(commitFiles, `Add ${info.name}`)
    await this.storage.push(commitHash)
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
    const source = files(info.files).map(async file => await fs.copy(path.join(srcDir, file), targetDir))
    return await Promise.all(source)
  }

  dirs() {
    const storageDir = this.storage.dir
    const config = this.config(storageDir)
    if (config?.categories === undefined) throw new Error('storage config parse error, not find categories')

    return Object.keys(config.categories).reduce((dirs: string[], dir) => {
      const subDir = fs.readdirSync(path.join(storageDir, dir)).map(sub => path.join(dir, sub))
      return [...dirs, ...subDir]
    }, [])
  }

  count() {
    const dirs = this.dirs()
    const log: Map<string, MaterialInfo> = new Map()

    return dirs.reduce((log, dir) => {
      log.set(dir, this.parse(path.join(this.storage.dir, dir)))
      return log
    }, log)
  }

  parse(dir: string): MaterialInfo {
    const info = fs.readJSONSync(path.join(dir, DEFAULT_CONFIG_FILE))
    const { name, description, keywords, dependencies, files } = info

    return {
      name,
      category: info[CONFIG_FILED].category,
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
    this.log.set(`${info.category}/${info.name}`, info)
  }

  has(info: MaterialInfo) {
    return this.log.has(`${info.category}/${info.name}`)
  }
}

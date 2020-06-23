import fs from 'fs-extra'
import path from 'path'

import Detector, { DetectorType } from './detector'
import Config, { RepositoryConfig } from './config'
import { CONFIG_EXT } from './constant'
import Storage from './storage'
import History, { recordRow } from './history'
import Material from './material'

interface RepositoryList {
  repository: {
    [repositoryName: string]: Repository
  }
  size: number
}

export default class Repository extends Detector {
  private static configList(dir: string): string[] {
    const files = fs.readdirSync(dir)
    const configFile = files
      .filter((file) => path.extname(file) === CONFIG_EXT)
      .map((f) => path.resolve(dir, f))
    return configFile
  }

  static repositoryList(): RepositoryList {
    const storage = Storage.storage()
    const configFiles = this.configList(storage.dir)
    const size = configFiles.length

    let repository = {}

    if (configFiles.length !== 0) {
      repository = configFiles.reduce(
        (repositories: RepositoryList['repository'], configFile) => {
          const repository = new Repository(configFile)
          const repositoryName = repository.repositoryName
          repositories[repositoryName] = repository
          return repositories
        },
        {}
      )
    }

    return {
      repository,
      size
    }
  }

  static async init(name: string, configContent: RepositoryConfig) {
    const storage = Storage.storage()
    const configFile = path.resolve(storage.dir, `${name}${CONFIG_EXT}`)
    const config = new Config<RepositoryConfig>(configFile)
    await config.genConfig(configContent)
    await storage.commit([configFile], `Init ${name} repository`)
    return new Repository(configFile)
  }

  static find(name: string) {
    const { repository } = this.repositoryList()
    if (repository[name] !== undefined) {
      return repository[name]
    }
    return null
  }

  private readonly config: RepositoryConfig
  private readonly history: Promise<History>

  readonly configFile: string
  readonly repositoryName: string

  constructor(configFile: string) {
    super()
    const config = new Config<RepositoryConfig>(configFile).getConfig()

    if (config === null) {
      throw new Error(
        `repository config ${configFile} does not exist, Please init first`
      )
    }

    const repositoryName = config.repository

    this.configFile = configFile
    this.config = config
    this.repositoryName = repositoryName
    this.history = History.init(this)
  }

  getConfig() {
    return this.config
  }

  async checkEnv() {
    if (this.config.env === undefined) return
    return await this.getDetectorByType(DetectorType.env)(this.config.env)
  }

  async checkPackage() {
    if (this.config.package === undefined) return
    return await this.getDetectorByType(DetectorType.package)(
      this.config.package
    )
  }

  async record(record: recordRow) {
    const history = await this.history
    await history.insert(record)
    await this.commit()
  }

  private message() {
    return `Update ${this.config.repository} repository history`
  }

  private async commit() {
    const storage = Storage.storage()
    const historyFile = (await this.history).historyFile
    return await storage.commit([historyFile], this.message())
  }

  async searchMaterial(name: string, category?: string) {
    const history = await this.history
    const condition = category !== undefined ? { name, category } : { name }
    return history.search(condition)
  }

  async find(name: string, category: string) {
    const materials = await this.searchMaterial(name, category)
    if (materials.length === 0) return null
    const materialInfo = History.transform(materials[0])
    const materialDir = path.resolve(
      Storage.storage().dir,
      this.config.repository,
      materialInfo.dir
    )
    const config = Material.parse(materialDir)
    if (config === null) return null
    return new Material(this, config)
  }

  async update() {
    const storage = Storage.storage()
    const historyFile = (await this.history).historyFile
    const configFile = this.configFile
    await storage.fetch()
    await storage.checkout([configFile, historyFile])
  }
}

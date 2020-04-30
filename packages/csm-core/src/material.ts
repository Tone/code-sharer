import path from 'path'
import fs from 'fs-extra'

import Config, { MaterialConfig } from './config'
import Detector, { DetectorType } from './detector'
import Repository from './repository'
import Storage from './storage'
import { DEFAULT_NAME_STYLE, DEFAULT_MATERIAL_CONFIG_NAME } from './constant'
import { stringify } from './utils'
import { recordRow } from './history'

type nameStyle = Pick<MaterialConfig, 'name' | 'author' | 'category' | 'repository'>;

export default class Material extends Detector {
  static parse(configPath: string) {
    return new Config<MaterialConfig>(configPath).getConfig()
  }

  static async init(config: MaterialConfig) {
    const repository = await Repository.find(config.repository)
    if (repository === null) {
      return null
    }

    return new Material(repository, config)
  }

  private readonly repository: Repository
  private readonly config: MaterialConfig
  private readonly dirName: string

  private dir = ''

  constructor(repository: Repository, config: MaterialConfig) {
    super()
    this.repository = repository
    this.config = config

    this.dirName = this.getDirName()
  }

  async checkExist() {
    const { name, category } = this.config
    await this.repository.update()
    const records = await this.repository.searchMaterial(name, category)
    return records.length !== 0
  }

  async checkDir(src: string[]) {
    const { category } = this.config
    const { category: categories, repository } = this.repository.getConfig()
    if (categories[category] === undefined) {
      throw new Error(`category ${category} does not exist in repository ${repository}`)
    }

    const { dir } = categories[category]
    return await this.getDetectorByType(DetectorType.dir)(src, dir)
  }

  async checkField() {
    const { category } = this.config
    const { category: categories, repository } = this.repository.getConfig()
    if (categories[category] === undefined) {
      throw new Error(`category ${category} does not exist in repository ${repository}`)
    }
    const { checklist } = categories[category]
    if (checklist === undefined) return
    return await this.getDetectorByType(DetectorType.checklist)(checklist, this.config)
  }

  async checkPackage() {
    await this.repository.checkPackage()
    if (this.config.package === undefined) return
    return await this.getDetectorByType(DetectorType.package)(this.config.package)
  }

  private getSrcFileDir(files: string[]) {
    // TODO need rewrite find min length
    files.sort((a, b) => a.length - b.length)
    const srcDir = path.dirname(files[0])
    return srcDir
  }

  private getDirName() {
    const style = this.repository.getConfig().style ?? DEFAULT_NAME_STYLE
    const dirName = stringify(style, this.config as nameStyle)
    return dirName
  }

  async getDir() {
    if (this.dir !== '') return this.dir
    const storage = Storage.storage()
    const repository = this.config.repository
    this.dir = path.resolve(storage.dir, repository, this.dirName)
    return this.dir
  }

  async genConfig() {
    const dir = await this.getDir()
    const configPath = path.resolve(dir, DEFAULT_MATERIAL_CONFIG_NAME)
    const config = new Config<MaterialConfig>(configPath)
    await config.genConfig(this.config)
    return configPath
  }

  private message() {
    return `Update ${this.config.name} for ${this.config.repository} repository`
  }

  private async commit(files: string[]) {
    const storage = Storage.storage()
    return await storage.commit(files, this.message())
  }

  private async record(files: string[]) {
    const commitId = await this.commit(files)
    const record: recordRow = [
      this.config.name,
      this.config.category,
      this.config.author,
      commitId,
      this.config.tags?.join() ?? '',
      this.config.description ?? '',
      this.dirName
    ]

    await this.repository.record(record)
  }

  async submitCheck(relativeFiles: string[]) {
    await this.checkField()
    await this.checkDir(relativeFiles)
  }

  async submit(srcDir: string) {
    const dir = await this.getDir()
    const relativeFiles = await (await fs.readdir(srcDir)).map(f => path.relative(srcDir, f))
    await this.submitCheck(relativeFiles)
    await fs.copy(srcDir, dir)
    await this.genConfig()
    const files = await fs.readdir(dir)
    await this.record(files)
  }

  async submitFile(files: string[]) {
    const srcFileDir = this.getSrcFileDir(files)
    const dir = await this.getDir()
    const dirFiles: string[] = []
    const relativeFiles: string[] = []

    files.forEach((file) => {
      const relativeFile = path.relative(srcFileDir, file)
      const dirFile = path.resolve(dir, relativeFile)
      relativeFiles.push(relativeFile)
      dirFiles.push(dirFile)
    })
    await this.submitCheck(relativeFiles)

    files.forEach((file, index) => {
      fs.copySync(file, dirFiles[index])
    })
    const configPath = await this.genConfig()
    await this.record([...dirFiles, configPath])
  }

  async pick(srcDir: string) {
    await this.repository.checkEnv()
    await this.checkPackage()
    const dir = await this.getDir()
    await fs.copy(dir, srcDir)
  }
}

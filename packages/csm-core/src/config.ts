import toml, { JsonMap } from '@iarna/toml'
import fs from 'fs-extra'

export interface Env {
  exec: string
  version: string
}

export interface Package {
  name: string
  version: string
}

interface Category {
  position: string
  dir: string[]
  inject?: boolean
  checklist?: Record<string, boolean>
}

export interface RepositoryConfig {
  repository: string
  style?: string
  env?: Env[]
  package?: Package[]
  category: Record<string, Category>
}

export interface MaterialConfig {
  repository: string
  category: string
  name: string
  description?: string
  author: string
  tags?: string[]
  inject?: string
  package?: Package[]
  var?: Record<string, any>
}

export default class Config<T extends RepositoryConfig | MaterialConfig> {
  config: T | null
  private readonly configFile: string
  constructor(configFile: string) {
    this.configFile = configFile
    this.config = null
  }

  private parse(file: string) {
    const fileStr = fs.readFileSync(file).toString()

    this.config = toml.parse(fileStr) as unknown as T
    return this.config
  }

  private async write(filePath: string, config: T) {
    const configContent = toml.stringify(config as unknown as JsonMap)
    await fs.outputFile(filePath, configContent)
    this.config = config
  }

  getConfig() {
    if (this.config !== null) {
      return this.config
    }
    if (fs.pathExistsSync(this.configFile)) {
      return this.parse(this.configFile)
    }

    return null
  }

  // TODO change static method
  async genConfig(config: T) {
    await this.write(this.configFile, config)
    this.config = config
  }
}

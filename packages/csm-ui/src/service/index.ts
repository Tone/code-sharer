import path from 'path'
import { v4 as uuid } from 'uuid'
import git from 'simple-git'
import fs from 'fs-extra'
import { Storage, Repository, RepositoryList, History } from '@tone./csm-core'

import {
  TEMP_DIR,
  cacheFile,
  officialRemoteStoreListUrl,
  customRemoteStoreListUrl
} from './config'

class Store {
  private cache: { [index: string]: string | undefined }
  private repos: RepositoryList
  readonly storeUrl: string[]

  store: Set<string>

  constructor(storeUrl: string[]) {
    this.cache = fs.existsSync(cacheFile) ? fs.readJSONSync(cacheFile) : {}
    this.storeUrl = storeUrl.filter((url) => url !== '')
    this.store = new Set()
    this.repos = {
      repository: {},
      size: 0
    }
  }

  async add(url: string) {
    if (/.git$/.test(url)) {
      await this.download(url)
      this.store.add(url)
    } else {
      this.store.add(url)
    }
  }

  remove(url: string) {
    this.store.delete(url)
    this.deleteCache(url)
  }

  private getDir(id: string) {
    return path.join(TEMP_DIR, id)
  }

  private exist(url: string) {
    const cacheId = this.getCache(url)
    if (cacheId === undefined) return
    if (!fs.existsSync(this.getDir(cacheId))) return
    return cacheId
  }

  async init(cache = true) {
    const downloadDir = this.storeUrl.map(async (url: string) => {
      if (cache) {
        const cacheId = this.exist(url)
        if (cacheId !== undefined) return await Promise.resolve(cacheId)
      }
      return await this.download(url)
    })

    const ids = await Promise.all(downloadDir)
    this.writeCache()

    ids.forEach((id) => {
      this.parseStore(id).forEach((s) => this.store.add(s))
    })
  }

  parseStore(id: string) {
    const dir = this.getDir(id)
    const repos = path.join(dir, 'repos')

    if (fs.existsSync(repos)) {
      const file = fs.readFileSync(repos)
      return file
        .toString()
        .split(/\n|\r/)
        .filter((s) => s !== '')
    }

    return []
  }

  async download(url: string): Promise<string> {
    const id = uuid()
    const tempPath = this.getDir(id)

    await fs.ensureDir(tempPath)
    const repository = git(tempPath)
    await repository.clone(url, tempPath, ['--depth', '1'])
    this.setCache(url, id)
    return id
  }

  clean() {
    this.cache = {}
    this.writeCache()
  }

  getCache(key: string) {
    return this.cache[key]
  }

  setCache(key: string, val: string) {
    this.cache[key] = val
  }

  deleteCache(key: string) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.cache[key]
  }

  writeCache() {
    fs.writeJSONSync(cacheFile, this.cache)
  }

  async refresh(url: string) {
    const id = this.getCache(url)
    if (id !== undefined) {
      fs.removeSync(this.getDir(id))
      const newId = await this.download(url)
      this.setCache(url, newId)
      this.writeCache()
    }
  }

  async parseRepo(url: string) {
    let id = this.exist(url)

    if (id === undefined) {
      id = await this.download(url)
    }
    const dir = this.getDir(id)

    await Storage.check(dir)
    await Storage.init(dir)
    const repos = Repository.repositoryList()
    this.repos = repos
    return repos
  }

  async getMaterials(repo: string, category: string) {
    const { repository } = this.repos

    if (repository[repo] !== undefined) return []

    const record = await repository[repo].searchMaterial('', category)

    return record.map((r) => History.transform(r))
  }

  async findMaterial(repo: string, category: string, name: string) {
    const { repository } = this.repos

    if (repository[repo] !== undefined) return null

    return await repository[repo].find(name, category)
  }
}

export default new Store([officialRemoteStoreListUrl, customRemoteStoreListUrl])

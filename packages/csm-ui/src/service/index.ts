import path from 'path'

import fs from 'fs-extra'
import Material from '@tone./csm-core'
import { config } from '@tone./csm-utils'

class Store {
  static store: null | Store = null
  static async init() {
    const storages: Array<[string, Material]> = await Promise.all(config.search('storage').map(async (storage: string) => [storage, await Material.init(storage)]))
    Store.store = new Store(storages)
    return Store.store
  }

  private readonly storages: Map<string, Material>

  constructor(storages: Array<[string, Material]>) {
    this.storages = new Map(storages)
  }

  async add(url: string) {
    const storage = await Material.init(url)
    this.storages.set(url, storage)
  }

  remove(url: string) {
    this.storages.delete(url)
  }

  get urls() {
    return Array.from(this.storages.keys())
  }

  repo(url: string) {
    return this.storages.get(url)
  }

  get repos(): any {
    return Array.from(this.storages.entries()).map(([url, storage]) => {
      return {
        url,
        material: Array.from(storage.log.values())
      }
    })
  }

  async download(url: string) {

  }

  async refresh(url: string) {

  }

  async parseRepo(url: string) {

  }

  async getMaterials(repo: string, category: string) {

  }

  async findMaterial(repo: string, category: string, name: string) {

  }
}

export default Store

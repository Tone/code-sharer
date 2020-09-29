import Material from '@tone./csm-core'
import { config } from '@tone./csm-utils'
import { MaterialInfo } from '../interface'

class Store {
  static store: null | Store = null
  static async init() {
    if (Store.store !== null) return Store.store
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

  get repos() {
    return Array.from(this.storages.keys()).map(url => this.parseRepo(url))
  }

  async download(url: string, category: string, name: string, dest: string) {
    const [center, material] = this.findMaterial(url, category, name)
    return await center.download(material, dest)
  }

  async refresh(url: string) {
    const center = this.getCenter(url)
    await center.update()
    return this.parseRepo(url)
  }

  async refreshAll() {
    await Promise.all(Array.from(this.storages.values()).map(async center => await center.update()))
    return this.repos
  }

  parseRepo(url: string) {
    const center = this.getCenter(url)
    return {
      url,
      material: Array.from(center.log.values()).map(material => ({ ...material, url }))
    }
  }

  async getMaterials(repo: string, category: string) {

  }

  private getCenter(repo: string) {
    const center = this.storages.get(repo)
    if (center === undefined) throw new Error(`${repo} is not a storage`)
    return center
  }

  private findMaterial(repo: string, category: string, name: string): [Material, MaterialInfo] {
    const center = this.getCenter(repo)
    const material = center.find(category, name)
    if (material === null) throw new Error(`No ${category} ${name} found in ${repo} is not a storage`)
    return [center, material]
  }
}

export default Store

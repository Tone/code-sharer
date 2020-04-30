import Git, { SimpleGit } from 'simple-git/promise'
import fs from 'fs-extra'

import { DEFAULT_REPOSITORY_PATH, REMOTE_NAME, DEFAULT_BRANCH } from './constant'

export default class Storage {
  static async clone(url: string, dir = DEFAULT_REPOSITORY_PATH) {
    await fs.ensureDir(dir)
    const repository = Git(dir)
    await repository.clone(url, dir)
    return new Storage(repository, dir)
  }

  static async discover(dir = DEFAULT_REPOSITORY_PATH) {
    await fs.ensureDir(dir)
    const repository = Git(dir)
    if (!await repository.checkIsRepo()) {
      await repository.init()
    }

    return new Storage(repository, dir)
  }

  static async init(dir = DEFAULT_REPOSITORY_PATH, url?: string) {
    this.storageCache = url !== undefined ? await Storage.clone(url, dir) : await Storage.discover(dir)
    return this.storageCache
  }

  static async check(dir: string) {
    if (!fs.pathExistsSync(dir)) {
      throw new Error(`${dir} does not exist, please run init first `)
    }
    const repository = Git(dir)
    if (!await repository.checkIsRepo()) {
      throw new Error('Storage does not init, please run init first ')
    }
  }

  private static storageCache: null | Storage = null

  static storage() {
    if (Storage.storageCache !== null) return Storage.storageCache
    throw new Error('Storage does not init, please run init first ')
  }

  private readonly repository: SimpleGit
  readonly dir: string

  constructor(repository: SimpleGit, dir: string) {
    this.repository = repository
    this.dir = dir
  }

  async commit(files: string[], message: string) {
    await this.repository.add(files)
    await this.repository.commit(files, message)
    const commitId = await this.repository.show(['-s', '--format=%H'])
    return commitId
  }

  async fetch(remote = REMOTE_NAME) {
    await this.repository.fetch(remote)
    return this
  }

  async checkout(files: string[], remote = REMOTE_NAME, branch = DEFAULT_BRANCH) {
    let remoteBranch = `${remote}/${branch}`
    if (remote === '' || branch === '') {
      remoteBranch = `${REMOTE_NAME}/${DEFAULT_BRANCH}`
    }
    await this.repository.checkout([remoteBranch, ...files])
    return this
  }

  async push(remote = REMOTE_NAME, branch = DEFAULT_BRANCH) {
    await this.repository.push(remote, branch)
    return this
  }

  async config(name: string) {
    const configs = await this.repository.listConfig()
    return configs.all[name]
  }

  async author() {
    const [name, email] = await Promise.all([this.config('name'), this.config('email')])
    if (typeof name === 'string' && typeof email === 'string') {
      return `${name} <${email}>`
    }
    return ''
  }
}

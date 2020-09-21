import Git, { SimpleGit } from 'simple-git/promise'
import fs from 'fs-extra'

import {
  DEFAULT_REPOSITORY_PATH,
  REMOTE_NAME,
  DEFAULT_BRANCH
} from './constant'

export default class Storage {
  static async clone(url: string, dir = DEFAULT_REPOSITORY_PATH) {
    const repository = Git(dir)
    await repository.clone(url, dir, ['--depth', '1'])
    return new Storage(repository, dir)
  }

  static async init(
    dir = DEFAULT_REPOSITORY_PATH,
    branch = DEFAULT_BRANCH,
    url?: string
  ) {
    await fs.ensureDir(dir)
    const repository = Git(dir)
    const isRepo = await repository.checkIsRepo()
    let storage

    if (isRepo) {
      storage = new Storage(repository, dir)
      await storage.branch(branch)
      await storage.pull()
      return storage
    } else if (url !== undefined) {
      storage = await Storage.clone(url, dir)
      await storage.branch(branch)
      return storage
    }

    await repository.init()
    storage = new Storage(repository, dir)
    await storage.branch(branch)
    await storage.pull()
    return storage
  }

  private readonly repository: SimpleGit
  dir: string

  constructor(repository: SimpleGit, dir: string) {
    this.repository = repository
    this.dir = dir
  }

  async commit(files: string[], message: string) {
    await this.repository.add(files)
    const commitInfo = await this.repository.commit(message, files)
    if (commitInfo === null) {
      throw new Error('commit error, please check if git config is correct')
    }
    return commitInfo.commit
  }

  async fetch(remote = REMOTE_NAME) {
    await this.repository.fetch(remote)
    return this
  }

  async checkout(
    files: string[],
    remote = REMOTE_NAME,
    branch = DEFAULT_BRANCH
  ) {
    let remoteBranch = `${remote}/${branch}`
    if (remote === '' || branch === '') {
      remoteBranch = `${REMOTE_NAME}/${DEFAULT_BRANCH}`
    }
    await this.repository.checkout([remoteBranch, ...files])
    return this
  }

  async pull(remote = REMOTE_NAME, branch = DEFAULT_BRANCH) {
    await this.repository.pull(remote, branch, ['-r'])
  }

  async push(
    commitHash?: string,
    remote = REMOTE_NAME,
    branch = DEFAULT_BRANCH
  ) {
    let remoteBranch = branch
    if (commitHash !== undefined) {
      remoteBranch = `${commitHash}:${branch}`
    }
    await this.pull(remote, branch)
    await this.repository.push(remote, remoteBranch)
    return this
  }

  async config(name: string) {
    const configs = await this.repository.listConfig()
    return configs.all[name]
  }

  async author() {
    const [name, email] = await Promise.all([
      this.config('user.name'),
      this.config('user.email')
    ])
    if (typeof name === 'string' && typeof email === 'string') {
      return `${name} <${email}>`
    }
    return ''
  }

  async head() {
    return (await this.repository.status()).current
  }

  async branch(name: string, remote = REMOTE_NAME) {
    return await this.repository.checkoutBranch(name, `${remote}/${name}`)
  }
}

import Git, { SimpleGit } from 'simple-git/promise'
import fs from 'fs-extra'

import {
  DEFAULT_REPOSITORY_PATH,
  REMOTE_NAME,
  DEFAULT_BRANCH
} from './constant'

/**
 * 提供存储库基础操作
 * - 文件提交及版本生成
 * - 远端更新及推送
 * - 仓库信息
 * - 特定版本文件检出
 */
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
    if (!(await repository.checkIsRepo())) {
      await repository.init()
    }

    return new Storage(repository, dir)
  }

  static async init(dir = DEFAULT_REPOSITORY_PATH, url?: string) {
    this.storageCache =
      url !== undefined
        ? await Storage.clone(url, dir)
        : await Storage.discover(dir)
    return this.storageCache
  }

  static async check(dir: string) {
    if (!fs.pathExistsSync(dir)) {
      throw new Error(`${dir} does not exist, please run init first `)
    }
    const repository = Git(dir)
    if (!(await repository.checkIsRepo())) {
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

  async push(
    commitHash?: string,
    remote = REMOTE_NAME,
    branch = DEFAULT_BRANCH
  ) {
    let remoteBranch = branch
    if (commitHash !== undefined) {
      const nextHash = await this.nextCommit(commitHash)
      remoteBranch = `${nextHash}:${branch}`
    }
    await this.repository.pull(remote, branch, ['-r'])
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

  private async nextCommit(cur: string) {
    const info = await this.repository.log([
      '--reverse',
      '--ancestry-path',
      `${cur}^..HEAD`
    ])
    return info.all[1].hash
  }
}

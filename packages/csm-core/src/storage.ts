import Git, { SimpleGit } from 'simple-git/promise'
import fs from 'fs-extra'
import path from 'path'
import crypto from 'crypto'

import {
  DEFAULT_REPOSITORY_PATH,
  REMOTE_NAME,
  DEFAULT_BRANCH
} from './constant'

const HASH = crypto.createHash('sha256')

export default class Storage {
  static async clone(url: string, dir = DEFAULT_REPOSITORY_PATH) {
    fs.emptyDirSync(dir)
    const repository = Git(dir)
    await repository.clone(url, dir, ['--depth', '1'])
    const root = await repository.revparse(['--show-toplevel'])
    return new Storage(repository, root)
  }

  static async init(repo: string) {
    if (path.isAbsolute(repo)) {
      const repository = Git(repo)
      const isRepo = await repository.checkIsRepo()
      if (!isRepo) throw new Error(`${repo} is not a git repo`)
      const root = await repository.revparse(['--show-toplevel'])

      return new Storage(repository, root)
    }

    const dir = path.join(DEFAULT_REPOSITORY_PATH, HASH.copy().update(repo).digest('hex'))

    if (fs.existsSync(dir)) {
      const repository = Git(dir)
      const root = await repository.revparse(['--show-toplevel'])
      const storage = new Storage(repository, root)
      await storage.pull()
      return storage
    }

    return await Storage.clone(repo, dir)
  }

  private readonly repository: SimpleGit
  dir: string

  constructor(repository: SimpleGit, dir: string) {
    this.repository = repository
    this.dir = dir
  }

  async commit(files: string[], message: string) {
    await this.repository.add(files)
    const commitInfo = await this.repository.commit(message)
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

  async status() {
    const status = await this.repository.status()
    return { ...status, isClean: status.isClean() }
  }

  async stash() {
    return await this.repository.stash()
  }

  async stashPop() {
    return await this.repository.stash(['pop'])
  }

  async branch(name: string, remote = REMOTE_NAME) {
    return await this.repository.checkoutBranch(name, `${remote}/${name}`)
  }
}

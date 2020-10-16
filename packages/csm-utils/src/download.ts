import os from 'os'
import fs from 'fs-extra'
import { v4 as uuid } from 'uuid'
import path from 'path'
import Git from 'simple-git/promise'
import execa from 'execa'
import tar from 'tar'

const TMP_DIR = os.tmpdir()

function isGit(url: string) {
  return url.includes('.git')
}

async function execEnv(dir: string) {
  const pnpm = require.resolve('pnpm')
  await execa('node', [pnpm, 'i'], { cwd: dir })
  const exec = fs.readJSONSync(path.join(dir, 'package.json'))?.main
  return exec !== undefined ? path.resolve(dir, exec) : dir
}

// repo.git#branch/path
function parseGit(url: string) {
  const matchArr = url.match(/(.+\.git)#(.+?(?=\/))?(\/.+)/)

  if (matchArr === null) return
  const [raw, repo, branch, dir] = matchArr
  return {
    raw,
    repo,
    branch: branch ?? 'master',
    dir
  }
}

async function downloadGit(url: string, dest: string) {
  const gitInfo = parseGit(url)
  if (gitInfo === undefined) throw new Error('parse git repo error')

  const { repo, branch, dir } = gitInfo

  await Git(dest).clone(repo, dest, [
    '--depth',
    '1',
    '--single-branch',
    '--branch',
    branch
  ])

  const execPath = path.join(dest, dir)
  return await execEnv(execPath)
}

async function downloadNpm(name: string, dest: string) {
  const { stdout: packName } = execa.sync('npm', ['pack', name], { cwd: dest })
  await tar.x({
    cwd: dest,
    file: path.join(dest, packName)
  })

  const execPath = path.join(dest, 'package')
  return await execEnv(execPath)
}

export default async function download(url: string) {
  const tmpDir = path.join(TMP_DIR, `csm-${uuid()}`)
  fs.ensureDirSync(tmpDir)
  try {
    if (isGit(url)) return await downloadGit(url, tmpDir)
    return await downloadNpm(url, tmpDir)
  } catch (e) {
    fs.removeSync(tmpDir)
    throw e
  }
}

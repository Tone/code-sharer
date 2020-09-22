import os from 'os'
import fs from 'fs-extra'
import { v4 as uuid } from 'uuid'
import path from 'path'
import Git from 'simple-git/promise'
import { execSync } from 'child_process'
import tar from 'tar'

const TMP_DIR = os.tmpdir()

function isGit(url: string) {
  return url.includes('.git')
}

// repo.git#branch/path
function parseGit(url: string) {
  const matchArr = url.match(/(.+\.git)(#.+){0,1}(\/.+)/)

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

  execSync('npm install', { cwd: execPath })
  return execPath
}

async function downloadNpm(name: string, dest: string) {
  const packName = execSync(`npm pack ${name}`, { cwd: dest }).toString()
  await tar.x({
    cwd: dest,
    file: packName
  })

  const execPath = path.join(dest, 'package')
  execSync(`npm install ${name}`, { cwd: execPath })

  return execPath
}

export default async function download(url: string) {
  const tmpDir = path.join(TMP_DIR, `csm-${uuid()}`)
  fs.ensureDirSync(tmpDir)

  if (isGit(url)) return await downloadGit(url, tmpDir)

  return await downloadNpm(url, tmpDir)
}

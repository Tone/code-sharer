import os from 'os'
import path from 'path'
import { v4 as uuid } from 'uuid'
import git from 'simple-git';
import fs from 'fs-extra'


const TEMP_DIR = path.join(os.tmpdir(), '.cms_ui')


export async function download(url: string): Promise<string> {
  const tempPath = path.join(TEMP_DIR, uuid())

  await fs.ensureDir(tempPath)
  const repository = git(tempPath)
  await repository.clone(url, tempPath)
  return tempPath
}







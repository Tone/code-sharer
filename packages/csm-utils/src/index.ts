import path from 'path'
import fs from 'fs-extra'
import os from 'os'
import { v4 as uuid } from 'uuid'

const TMP_DIR = os.tmpdir()

export const DEFAULT_CONFIG_FILE = 'package.json'

export const CONFIG_FILED = 'csmConfig'

export const DEFAULT_STORAGE_URL = 'git@github.com:Tone/csm-storage.git'

export function parseConfig(dir = process.cwd()) {
  const configFile = path.join(dir, DEFAULT_CONFIG_FILE)
  if (!fs.existsSync(configFile)) return null
  return fs.readJSONSync(configFile)[CONFIG_FILED] ?? null
}

export function download(url: string) {
  const tmpDir = path.join(TMP_DIR, `csm-${uuid()}`)
  fs.ensureDirSync(tmpDir)
  return tmpDir
}

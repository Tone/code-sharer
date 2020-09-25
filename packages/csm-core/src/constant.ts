import path from 'path'
import os from 'os'

const HOME_DIR: string = os.homedir()
const REPOSITORY_DIR = '.cms-center'

export const DEFAULT_REPOSITORY_PATH = path.resolve(HOME_DIR, REPOSITORY_DIR)

export const REMOTE_NAME = 'origin'

export const DEFAULT_BRANCH = 'master'

export const DEFAULT_CONFIG_FILE = 'package.json'

export const CONFIG_FILED = 'csmConfig'

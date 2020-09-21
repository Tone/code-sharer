import path from 'path'
import os from 'os'

const HOME_DIR: string = os.homedir()
const REPOSITORY_DIR = '.cms-center'

export const DEFAULT_REPOSITORY_PATH = path.resolve(HOME_DIR, REPOSITORY_DIR)

export const REMOTE_NAME = 'origin'

export const DEFAULT_BRANCH = 'master'

export const WIP_BRANCH = 'master'

export const DEFAULT_MATERIAL_CONFIG_NAME = 'info.json'

export const SOURCE_DIR = 'src'

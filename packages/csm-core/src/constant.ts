import path from 'path'
import os from 'os'

const HOME_DIR: string = os.homedir()
const REPOSITORY_DIR = '.cms-center'

export const DEFAULT_REPOSITORY_PATH = path.resolve(HOME_DIR, REPOSITORY_DIR)

export const REMOTE_NAME = 'origin'

export const DEFAULT_BRANCH = 'master'

export const CONFIG_EXT = '.toml'

export const DEFAULT_NAME_STYLE = '[name]@[category].[author:8]'

export const DEFAULT_MATERIAL_CONFIG_NAME = 'info.toml'

export const HISTORY_RECORD_EXT = '.csv'

export const HISTORY_RECORD_CSV_OPTION = {
  delimiter: '|'
}

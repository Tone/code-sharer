import os from 'os'
import path from 'path'

export const TEMP_DIR = path.join(os.tmpdir(), '.cms_ui')

export const officialRemoteStoreListUrl = 'git@github.com:Tone/csm-storage.git'

export const customRemoteStoreListUrl = process.env.STORE_URL ?? ''

export const cacheFile = path.join(os.tmpdir(), '.cms_ui', 'cache.json')

import os from 'os'
import path from 'path'

export const CONF_FILE = path.resolve(os.homedir(), '.csm.conf')

export const ERR_NAME = 'CLI_ERR'

export const DEFAULT_TEMPLATE_URL =
  'https://github.com/Tone/code-sharer/tree/simple/packages/csm-template-vue'

import { CONF_FILE } from './config'
import Material from '@tone./csm-core'

import fs from 'fs-extra'
import Err from './err'

export default async function () {
  if (!fs.pathExistsSync(CONF_FILE)) {
    throw new Err('remote storage is not set, please run init first')
  } else {
    const { remote, stable, beta } = fs.readJsonSync(CONF_FILE)
    if (remote === undefined || remote === '') {
      throw new Err('remote storage is not set, please run init first')
    }

    return Material.init(remote, { stable, beta })
  }
}

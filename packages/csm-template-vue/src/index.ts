import { Template } from '@tone./csm-core'
import path from 'path'
import ejs from 'ejs'
import fs from 'fs-extra'

class Generate extends Template {
  async init(dir: string) {
    const name = path.basename(dir)
    const file = await ejs.renderFile(path.resolve(__dirname, '../template/package.json'), { name })
    await fs.outputFile(path.join(dir, 'package.json'), file)
  }
}

export default new Generate()

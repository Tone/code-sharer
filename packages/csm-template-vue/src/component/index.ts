import path from 'path'
import execa from 'execa'
import fs from 'fs-extra'

class Generate {
  async init(dir: string) {
    const name = path.basename(dir)
    const cwd = path.dirname(dir)
    await fs.ensureDir(cwd)
    const vueCli = require.resolve('@vue/cli/bin/vue')

    const preset = path.resolve(__dirname, './preset')
    return await execa('node', [vueCli, 'create', name, '--preset', preset], {
      cwd
    })
  }
}

export default new Generate()

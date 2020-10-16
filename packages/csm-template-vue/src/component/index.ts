import path from 'path'
import execa from 'execa'
import fs from 'fs-extra'

const npmRegistry = 'https://registry.npmjs.org'

class Generate {
  async init(dir: string) {
    const name = path.basename(dir)
    const cwd = path.dirname(dir)
    await fs.ensureDir(cwd)
    const vueCli = require.resolve('@vue/cli/bin/vue')

    const preset = path.resolve(__dirname, './preset')
    return await execa('node', [vueCli, 'create', name, '--preset', preset, '-r', npmRegistry], {
      cwd
    })
  }
}

export default new Generate()

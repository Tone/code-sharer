import path from 'path'

import { execSync } from 'child_process'

class Generate {
  async init(dir: string) {
    const name = path.basename(dir)
    const vueCli = path.resolve(__dirname, '../../node_modules/.bin/vue')
    const preset = path.resolve(__dirname, './preset')

    execSync(`node ${vueCli} create ${name} --preset ${preset}`, {
      cwd: path.dirname(dir)
    })
  }
}

export default new Generate()

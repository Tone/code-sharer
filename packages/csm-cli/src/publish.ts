import Material from '@tone./csm-core'
import prompts from 'prompts'
import chalk from 'chalk'

import Err from './err'

export const command = 'publish'
export const describe = 'Publish material to repository'

export async function handler() {
  const dir = process.cwd()
  const materialCenter = await Material.init(dir)
  const materialInfo = materialCenter.parse(dir)

  if (materialInfo === null) throw new Err(`No package.json found in ${dir}`)
  console.log(chalk.green(materialCenter.format(materialInfo)))

  const { value } = (await prompts({
    type: 'confirm',
    name: 'value',
    message: `Publish ${materialInfo.name}`,
    initial: true
  }))
  if (value === true) {
    await materialCenter.publish(materialInfo)
  }
}

export default {
  command,
  describe,
  handler
}

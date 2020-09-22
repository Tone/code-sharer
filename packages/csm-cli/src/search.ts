import prompts, { PromptObject } from 'prompts'
import chalk from 'chalk'

import Material from '@tone./csm-core'
import { config } from '@tone./csm-utils'

export const command = 'search'
export const describe = 'Search material'

export async function handler() {
  const storages = config.search('storage')

  const storageSelect: PromptObject = {
    type: 'select',
    name: 'storage',
    message: 'Please select storage',
    choices: storages.map((s: string) => ({ title: s, value: s })),
    initial: 1
  }
  const { storage } = await prompts(storageSelect)
  const materialCenter = await Material.init(storage)

  const choices = Array.from(materialCenter.log.values()).map(m => ({ title: m.name, value: m, description: materialCenter.format(m) }))

  const searchMaterial: PromptObject[] = [
    {
      type: 'autocomplete',
      name: 'material',
      message: 'Select material',
      choices
    }
  ]

  const { material } = await prompts(searchMaterial)
  console.log(chalk.green(materialCenter.format(material)))
}

export default {
  command,
  describe,
  handler
}

import prompts, { PromptObject } from 'prompts'
import chalk from 'chalk'
import ora from 'ora'

import Material from '@tone./csm-core'
import { config } from '@tone./csm-utils'

export const command = 'search'
export const describe = 'Search material'

export async function handler() {
  const storages = config.search('storage')

  let storage = storages[0]

  if (storages.length > 1) {
    const storageSelect: PromptObject = {
      type: 'select',
      name: 'storage',
      message: 'Please select storage',
      choices: storages.map((s: string) => ({ title: s, value: s })),
      initial: 1
    }
    storage = await prompts(storageSelect)
  }
  const spinner = ora('updating storage').start()

  const materialCenter = await Material.init(storage)
  spinner.stop()

  const choices = Array.from(materialCenter.log.values()).map(m => ({ title: m.name, value: m, description: materialCenter.format(m) }))

  const searchMaterial: PromptObject[] = [
    {
      type: 'autocomplete',
      name: 'material',
      choices,
      message: 'Select material',
      suggest: async (input, allChoices) => allChoices.filter(({ value }) => {
        const val = value as Pick<typeof choices[0], 'value'>['value']
        return val.name.includes(input) || val.keywords.some((t) => t.includes(input))
      })
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

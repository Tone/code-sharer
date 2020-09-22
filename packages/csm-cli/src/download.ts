import { Arguments } from 'yargs'
import prompts, { PromptObject } from 'prompts'

import Material from '@tone./csm-core'
import { config } from '@tone./csm-utils'

export const command = 'download'
export const describe = 'Download material'

export async function handler(args: Arguments) {
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

  const choices = Array.from(materialCenter.log.values()).map(m => ({ title: m.name, value: m }))

  const searchMaterial: PromptObject[] = [
    {
      type: 'autocomplete',
      name: 'material',
      message: 'Select material',
      choices
    },
    {
      type: 'text',
      name: 'dir',
      message: 'Please input download location'
    }
  ]

  const { material, dir } = await prompts(searchMaterial)
  await materialCenter.download(material.name, dir)
}

export default {
  command,
  describe,
  handler
}

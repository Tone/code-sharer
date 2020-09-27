import { Arguments } from 'yargs'
import prompts, { PromptObject } from 'prompts'
import path from 'path'
import Material from '@tone./csm-core'
import { config } from '@tone./csm-utils'
import ora from 'ora'

export const command = 'download'
export const describe = 'Download material'

export async function handler(args: Arguments) {
  const storages = config.search('storage').map((s: string) => ({ title: s, value: s }))

  let storage = storages[0].value
  if (storages.length > 1) {
    const storageSelect: PromptObject = {
      type: 'select',
      name: 'storage',
      message: 'Please select storage',
      choices: storages,
      initial: 1
    }
    storage = (await prompts(storageSelect)).storage
  }
  const spinner = ora('updating storage').start()

  const materialCenter = await Material.init(storage)
  spinner.stop()

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
  spinner.text = `downloading ${material}`
  spinner.start()
  await materialCenter.download(material, path.resolve(process.cwd(), dir))
  spinner.stop()
}

export default {
  command,
  describe,
  handler
}

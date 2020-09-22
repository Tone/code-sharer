import { Arguments } from 'yargs'
import path from 'path'
import prompts, { PromptObject } from 'prompts'

import Material from '@tone./csm-core'
import { download } from '@tone./csm-utils'

import Err from './err'

export const command = 'create [name]'
export const describe = 'create material'

function templates(categories: string[]) {
  return categories.map((template) => ({
    title: template,
    value: template
  }))
}

export async function handler(args: Arguments) {
  const dir = process.cwd()
  const material = await Material.init(dir)
  const config = material.config(dir)

  if (config === null) throw new Err(`${dir} is not a storage`)

  const { categories, templateUrl } = config

  const questions: PromptObject[] = [
    {
      type: 'text',
      name: 'name',
      message: 'Please input material name',
      validate: async (val) => {
        const exist: boolean = await material.checkExist(val)
        return exist ? `${val} already exists` : true
      }
    },
    {
      type: 'select',
      name: 'template',
      message: 'Pick a material category',
      choices: templates(categories),
      initial: 1
    }
  ]

  const { name, template } = await prompts(questions)

  try {
    const templateExecFile = path.join(download(templateUrl), template)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const templateExec = require(templateExecFile)
    await material.create(templateExec, path.join(dir, template, name))
  } catch (e) {
    throw new Err(`create ${name} fail`)
  }
}

export default {
  command,
  describe,
  handler
}

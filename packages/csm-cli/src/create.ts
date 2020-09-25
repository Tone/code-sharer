import { Arguments } from 'yargs'
import path from 'path'
import prompts, { PromptObject } from 'prompts'

import Material from '@tone./csm-core'
import { download } from '@tone./csm-utils'

import Err from './err'

export const command = 'create [name]'
export const describe = 'create material'

enum templateType {
  LOCAL,
  REMOTE
}

function templates(categories: Record<string, string>) {
  return Object.keys(categories).map(template => ({
    title: template,
    value: {
      name: template,
      val: categories[template],
      type: /^\./.test(categories[template]) ? templateType.LOCAL : templateType.REMOTE
    }
  }))
}

export async function handler(args: Arguments) {
  const dir = process.cwd()
  const material = await Material.init(dir)
  const config = material.config(dir)

  const { categories, templateUrl } = config
  const categoryChoices = templates(categories)
  const hasCategory = categoryChoices.length > 1

  const questions: PromptObject[] = [
    {
      type: 'text',
      name: 'name',
      message: 'Please input material name',
      validate: async (val, prev) => {
        let dir = val
        if (prev.template !== undefined) {
          dir = `${prev.template.name}/${val}`
        }
        const exist: boolean = await material.checkExist(dir)
        return exist ? `${val} already exists` : true
      }
    }
  ]

  if (hasCategory) {
    questions.unshift(
      {
        type: 'select',
        name: 'template',
        message: 'Pick a material category',
        choices: categoryChoices,
        initial: 1
      })
  }

  const { name, template = categoryChoices[0] } = await prompts(questions)

  try {
    const templateExecFile = template.type === templateType.LOCAL ? path.join(await download(templateUrl), template.val) : await download(template.val)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const templateExec = require(templateExecFile)
    await material.create(templateExec, path.join(dir, template.name, name))
  } catch (e) {
    throw new Err(`create ${name} fail`)
  }
}

export default {
  command,
  describe,
  handler
}

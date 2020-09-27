import { Arguments } from 'yargs'
import path from 'path'
import prompts, { PromptObject } from 'prompts'
import ora from 'ora'

import Material from '@tone./csm-core'
import { download } from '@tone./csm-utils'

export const command = 'create'
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

  const questions: PromptObject[] = [
    {
      type: () => categoryChoices.length > 1 ? 'select' : null,
      name: 'template',
      message: 'Pick a material category',
      choices: categoryChoices,
      initial: 1
    },
    {
      type: 'text',
      name: 'name',
      message: 'Please input material name',
      validate: async (val, prev) => {
        let dir = val
        if (prev?.template !== undefined) {
          dir = `${prev.template.name}/${val}`
        }
        const exist: boolean = await material.checkExist(dir)
        return exist ? `${val} already exists` : true
      }
    }
  ]

  const { name, template = categoryChoices[0].value } = await prompts(questions)
  const spinner = ora('downloading template').start()

  try {
    let templateExecFile

    if (template.type === templateType.LOCAL) {
      const execDir = await download(templateUrl)
      templateExecFile = path.extname(execDir) !== '' ? path.resolve(path.dirname(execDir), template.val) : path.resolve(execDir, template.val)
    } else {
      templateExecFile = await download(template.val)
    }

    spinner.text = 'create material'
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: templateExec } = require(templateExecFile)
    const out = await material.create(templateExec, path.resolve(dir, template.name, name))
    console.log(typeof out === 'string' ? out : out?.stdout)
  } finally {
    spinner.stop()
  }
}

export default {
  command,
  describe,
  handler
}
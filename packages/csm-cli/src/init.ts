import fs from 'fs-extra'
import prompts, { PromptObject } from 'prompts'
import path from 'path'
import Err from './err'

export const command = 'init'
export const describe = 'Init material storage'

const storageTemplate = [
  {
    title: 'vue',
    value: '@tone./csm-template-vue'
  }
]

function existsDir(dir: string) {
  const dirPath = path.join(process.cwd(), dir)

  return fs.existsSync(dirPath) ? `${dirPath} already exists` : true
}

export async function handler() {
  const questions: PromptObject[] = [
    {
      type: 'text',
      name: 'name',
      message: 'Please input material storage name',
      validate: (val) => existsDir(val)
    },
    {
      type: 'select',
      name: 'templateDir',
      message: 'Pick a template',
      choices: storageTemplate,
      initial: 1
    }
  ]

  const { name, templateDir } = await prompts(questions)

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const template = require(templateDir)
    const dir = path.join(process.cwd(), name)
    await template.init(dir)
  } catch (e) {
    throw new Err('Init Err')
  }
}

export default {
  command,
  describe,
  handler
}

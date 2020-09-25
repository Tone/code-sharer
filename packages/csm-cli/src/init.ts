import fs from 'fs-extra'
import prompts, { PromptObject } from 'prompts'
import path from 'path'
import Err from './err'
import { config, download } from '@tone./csm-utils'

export const command = 'init'
export const describe = 'Init material storage'

function existsDir(dir: string) {
  const dirPath = path.join(process.cwd(), dir)
  return fs.existsSync(dirPath) ? `${dirPath} already exists` : true
}

export async function handler() {
  const choices = config.search('template').map((t: string) => ({ title: t, value: t }))

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
      choices
    }
  ]

  const { name, templateDir } = await prompts(questions)
  console.log(templateDir)
  try {
    const templateExecFile = await download(templateDir)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: template } = require(templateExecFile)
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

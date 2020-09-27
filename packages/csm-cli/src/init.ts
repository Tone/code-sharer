import fs from 'fs-extra'
import prompts, { PromptObject } from 'prompts'
import path from 'path'
import ora from 'ora'

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
      validate: (val) => val === '' ? true : existsDir(val)
    },
    {
      type: prev => prev === '' ? 'confirm' : null,
      name: 'curDir',
      message: 'remove all files in current dir ?'
    },
    {
      type: prev => prev !== false ? 'select' : null,
      name: 'templateDir',
      message: 'Pick a template',
      choices
    }
  ]

  const { name, templateDir, curDir } = await prompts(questions)
  if (curDir === false) return
  const spinner = ora('downloading template').start()

  try {
    const templateExecFile = await download(templateDir)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: template } = require(templateExecFile)
    const dir = path.join(process.cwd(), name)
    spinner.text = 'init template...'
    await template.init(dir)
  } finally {
    spinner.stop()
  }
}

export default {
  command,
  describe,
  handler
}

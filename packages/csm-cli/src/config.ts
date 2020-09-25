import Err from './err'
import { Arguments, Argv } from 'yargs'

import { config } from '@tone./csm-utils'

export const command = 'config <handle> [key] [value]'
export const describe = 'config storage'

export function builder(argv: Argv) {
  argv.positional('handle', {
    describe: 'handle type',
    type: 'string'
  })

  argv.positional('key', {
    describe: 'key',
    type: 'string'
  })

  argv.positional('value', {
    describe: 'value',
    type: 'string'
  })

  return argv
}

export async function handler(args: Arguments) {
  const handleType = ['add', 'remove', 'list']
  const keys = ['storage', 'template']

  const { handle, key, value } = args as { [key: string]: string }

  if (!handleType.includes(handle)) throw new Err('only support add, remove, list')
  if (!keys.includes(key)) throw new Err(`key is must one of ${keys.join(',')}`)

  let echo
  switch (handle) {
    case 'add':
      echo = config.add(key, value)
      break
    case 'remove':
      echo = config.remove(key, value)
      break
    case 'list':
      echo = config.search(key)
  }
  console.log(JSON.stringify(echo))
}

export default {
  command,
  builder,
  describe,
  handler
}

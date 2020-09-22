import Err from './err'
import { Arguments, Argv } from 'yargs'

import { config } from '@tone./csm-utils'

export const command = 'config <handle> [key] [val]'
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

  argv.positional('val', {
    describe: 'value',
    type: 'string'
  })

  return argv
}

export async function handler(args: Arguments) {
  const handleType = ['add', 'remove']
  const keys = ['storage', 'template']

  const { handle, key, value } = args as { [key: string]: string }

  if (!handleType.includes(handle)) throw new Err('only support add, remove')
  if (!keys.includes(key)) throw new Err(`key is must one of ${keys.join(',')}`)

  switch (handle) {
    case 'add':
      config.add(key, value)
      break
    case 'remove':
      config.remove(key, value)
  }
}

export default {
  command,
  builder,
  describe,
  handler
}

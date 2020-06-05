import { Repository } from '@csm/core'
import { Arguments, Argv } from 'yargs'
import check from './check'
import Err from './err'
import ora from 'ora'

export const command = 'update'
export const describe = 'Update repository'

export function builder(argv: Argv) {
  argv.positional('[name]', {
    describe: 'repository name',
    type: 'string'
  })

  return argv
}

export async function handler(args: Arguments) {
  await check()
  const name = args.name as string | undefined

  if (name === undefined) {
    const repositories = Repository.repositoryList()
    const spinner = ora('Updating...').start()

    const progress = Object.values(repositories.repository).map(async repository => {
      spinner.text = `Updating ${repository.getConfig().repository}`
      return await repository.update()
    })

    await Promise.all(progress)
    spinner.succeed('Done')
    return
  }

  await update(name)
}

async function update(name: string) {
  const repository = Repository.find(name)
  if (repository === null) throw new Err(`repository ${name} does not does not exist`)
  const spinner = ora(`Updating ${name}`).start()
  await repository.update()
  spinner.succeed('Done')
}

export default {
  command,
  describe,
  builder,
  handler
}

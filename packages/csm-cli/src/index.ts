#!/usr/bin/env node
import chalk from 'chalk'
import figlet from 'figlet'
import * as yargs from 'yargs'

import CliErr from './err'
import init from './init'
// import download from './pick'
// import publish from './publish'
// import search from './search'
// import create from './create'

console.log(chalk.yellow(figlet.textSync('CSM', { horizontalLayout: 'full' })))

const argv = yargs
  .command(init)
  // .command(create)
  // .command(download)
  // .command(publish)
  // .command(search)
  .demandCommand(1)
  .help()
  .wrap(null)
  .fail((msg, err: Error | CliErr, yargs) => {
    if (err instanceof CliErr) {
      console.log(chalk.bgRedBright(err.message))
      return
    }
    console.error('You broke it!')
    console.error(msg ?? err)
    console.error('You should be doing', yargs.help())
    process.exit(1)
  }).argv

export default argv

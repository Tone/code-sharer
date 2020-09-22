const ERR_NAME = 'CLI_ERR'

export default class CliErr extends Error {
  message: string
  name = ERR_NAME

  constructor(message: string) {
    super()
    this.message = message
  }
}

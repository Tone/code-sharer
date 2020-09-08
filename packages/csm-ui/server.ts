/* eslint-disable @typescript-eslint/no-floating-promises */
import { createServer } from 'http'
import next from 'next'

const port = parseInt(process.env.PORT ?? '3000', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const url = `http://localhost:${port}`

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = new URL(req.url ?? '', url)
    handle(req, res, parsedUrl as any)
  }).listen(port)

  // tslint:disable-next-line:no-console
  console.log(
    `> Server listening at ${url} as ${
    dev ? 'development' : process.env.NODE_ENV
    }`
  )
})

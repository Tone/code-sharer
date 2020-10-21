const { createServer } = require('https')

const next = require('next')
const fs = require('fs-extra')
const selfsigned = require('selfsigned')
const path = require('path')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev, dir: __dirname })
const handle = app.getRequestHandler()

const certificatePath = path.join(__dirname, '.ssl/server.pem')
const now = new Date()
const certificateTtl = 1000 * 60 * 60 * 24
const expire = 365

if (
  !fs.existsSync(certificatePath) ||
  (now - fs.statSync(certificatePath).ctime) / certificateTtl > expire
) {
  const attrs = [{ name: 'commonName', value: 'localhost' }]
  const pems = selfsigned.generate(attrs, { days: expire })

  fs.outputFileSync(certificatePath, pems.private + pems.cert, {
    encoding: 'utf8'
  })
}

const options = {
  key: fs.readFileSync(certificatePath),
  cert: fs.readFileSync(certificatePath)
}

app.prepare().then(() => {
  createServer(options, handle).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on https://localhost:${port}`)
  })
})

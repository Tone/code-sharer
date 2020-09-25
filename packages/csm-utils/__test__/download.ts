import fs from 'fs'
import path from 'path'
import download from '../src/download'

const gitRepo = 'git@github.com:Tone/code-sharer.git#simple/packages/csm-template-vue'
const npmPackage = '@tone./create-mock-middleware'

test('download npm package should be right', async () => {
  const dir = await download(npmPackage)
  if (path.extname(dir) === '') {
    expect(fs.existsSync(dir)).toBeTruthy()
  } else {
    expect(path.extname(dir)).toMatch(/js|ts/)
  }
})

test('download git repo should be right', async () => {
  const dir = await download(gitRepo)
  if (path.extname(dir) === '') {
    expect(fs.existsSync(dir)).toBeTruthy()
  } else {
    expect(path.extname(dir)).toMatch(/js|ts/)
  }
})

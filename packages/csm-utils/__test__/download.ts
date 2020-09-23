import fs from 'fs'
// import path from 'path'
import download from '../src/download'

const gitRepo = 'git@github.com:Tone/code-sharer.git#simple/packages/csm-template-vue'
test('download git repo should be right', async () => {
  const dir = await download(gitRepo)
  expect(fs.existsSync(dir)).toBeTruthy()
})

import fs from 'fs-extra'
import path from 'path'
import template from '../src'

test('template generate should be right', async () => {
  const dirName = 'template'
  const targetDir = path.join(__dirname, dirName)

  fs.ensureDirSync(targetDir)
  await template.init(targetDir)
  expect(fs.existsSync(path.join(targetDir, 'package.json'))).toBeTruthy()
  expect(fs.readJSONSync(path.join(targetDir, 'package.json')).name).toBe(dirName)
  fs.removeSync(targetDir)
})

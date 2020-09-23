import fs from 'fs-extra'
import path from 'path'
import template from '../src/component'

test('template generate should be right', async () => {
  const dirName = 'component_template'
  const targetDir = path.join(__dirname, dirName)

  await template.init(targetDir)
  expect(fs.existsSync(targetDir)).toBeTruthy()
  fs.removeSync(targetDir)
})

import fs from 'fs-extra'
import path from 'path'

import Config, { RepositoryConfig, MaterialConfig } from '../src/config'

const testGenFile = path.resolve(__dirname, 'info.toml')
const repositoryTestFile = path.resolve(__dirname, '../../../example/repository.toml')

const repositoryConfig: RepositoryConfig = { category: { block: { dir: [], position: '' }, component: { checklist: { author: false, description: true, inject: false, name: false, tags: false }, dir: [], inject: false, position: '' }, page: { dir: [], position: '' }, project: { dir: [], position: '' } }, env: [{ exec: 'node', version: '10.0.0' }, { exec: 'npm', version: '4.7.0' }], package: [{ name: 'vue', version: '2.6.10' }, { name: 'ant-design-vue', version: '1.4.12' }], repository: 'vue', style: '' }

const materialTestFile = path.resolve(__dirname, '../../../example/material.toml')

const materialConfig: MaterialConfig = { author: '', category: 'component', description: '', inject: '', name: '', package: [{ name: 'vue', version: '2.6.10' }, { name: 'ant-design-vue', version: '1.4.12' }], repository: 'vue', tags: [], var: [{ name: '', path: 'style/theme.less', type: 'less' }, { name: 'api', path: 'api/index.js', type: 'js' }] }

test('parse repository config should be right ', () => {
  const config = new Config<RepositoryConfig>(repositoryTestFile)

  expect(config.config).toBeNull()
  expect(config.getConfig()).toMatchObject(repositoryConfig)
})

test('parse material config should be right ', () => {
  const config = new Config<MaterialConfig>(materialTestFile)

  expect(config.config).toBeNull()
  expect(config.getConfig()).toMatchObject(materialConfig)
})

test('gen config file should be right', async () => {
  const config = new Config<MaterialConfig>(testGenFile)
  expect.assertions(3)
  await config.genConfig(materialConfig)
  expect(config.config).not.toBeNull()
  expect(fs.existsSync(testGenFile)).toBe(true)
  expect(fs.readFileSync(testGenFile).toString()).toMatch(/author|category|description|inject|name |repository |tags/)
  fs.removeSync(testGenFile)
})

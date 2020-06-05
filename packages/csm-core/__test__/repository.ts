import path from 'path'
import fs from 'fs-extra'
import Repository from '../src/repository'
import Storage from '../src/storage'
import History, { recordRow } from '../src/history'
import Material from '../src/material'

jest.mock('../src/storage')
jest.mock('../src/history')
jest.mock('../src/material')

const testConfig = fs.readFileSync(path.resolve(__dirname, '../../../example/repository.toml')
).toString()

const testConfigObj = { category: { block: { dir: [], position: '' }, component: { checklist: { author: false, description: true, inject: false, name: false, tags: false }, dir: [], inject: false, position: '' }, page: { dir: [], position: '' }, project: { dir: [], position: '' } }, env: [{ exec: 'node', version: '8.0.0' }, { exec: 'npm', version: '2.7.0' }], package: [{ name: 'vue', version: '2.6.10' }, { name: 'ant-design-vue', version: '1.4.12' }], repository: 'vue', style: '' }

const testDir = path.resolve(__dirname, 'test_storage__')
const testFile = path.resolve(testDir, 'test.toml')

const StorageMock = {
  dir: testDir,
  show: jest.fn().mockReturnValue('sss'),
  checkIsRepo: jest.fn().mockResolvedValue(true),
  add: jest.fn(),
  commit: jest.fn(),
  fetch: jest.fn(),
  push: jest.fn(),
  listConfig: jest.fn().mockResolvedValue({ all: { name: 't', email: 't' } }),
  checkout: jest.fn()
}

const storage = jest.fn().mockReturnValue(StorageMock)

const historyIns = jest.fn()
const historySearch = jest.fn()
const historyInit = jest.fn().mockResolvedValue({
  historyFile: 'historyFile',
  insert: historyIns,
  search: historySearch
})

beforeAll(() => {
  Storage.storage = storage
  History.init = historyInit
  History.transform = jest.fn().mockReturnValue({
    name: '1',
    category: '2',
    author: '3',
    commitID: '1',
    tags: '2',
    description: '3',
    dir: '1',
    ctm: 1,
    mtm: 2
  })
})

beforeEach(() => {
  fs.ensureDirSync(testDir)
})

afterEach(() => {
  fs.removeSync(testDir)
})

describe('repository static method  should be right', () => {
  test('find method should be right', () => {
    expect(Repository.find('test')).toBeNull()
    fs.outputFileSync(testFile, testConfig)
    expect(Repository.find('test')).toBeInstanceOf(Repository)
    expect(storage).toBeCalledTimes(2)
  })

  test('repositoryList method should be right', () => {
    expect(Repository.repositoryList()).toEqual({ size: 0, repository: {} })
    fs.outputFileSync(testFile, testConfig)
    expect(Repository.repositoryList()).toMatchObject({ size: 1, repository: {} })
  })
  test('init method should be right', async () => {
    await expect(Repository.init('test', testConfigObj)).resolves.toBeInstanceOf(Repository)
    expect(storage).toBeCalled()
    expect(StorageMock.commit).toBeCalledTimes(1)
  })
})

describe('repository  method  should be right', () => {
  test('getConfig should be right', async () => {
    const repository = await Repository.init('vue', testConfigObj)
    expect(repository.getConfig()).toEqual(testConfigObj)
  })

  test('checkEnv should be right', async () => {
    let repository = await Repository.init('vue', testConfigObj)
    await expect(repository.checkEnv()).resolves.not.toThrow()
    repository = await Repository.init('test', { category: {}, env: [{ exec: 'node', version: '228.0.0' }, { exec: 'npm', version: '2.7.0' }], package: [], repository: 'test', style: '' })
    await expect(repository.checkEnv()).rejects.toMatchObject({ msg: 'env node version is wrong' })
    repository = await Repository.init('test', { category: {}, env: [{ exec: 'nodesss', version: '2.0.0' }, { exec: 'npm', version: '2.7.0' }], package: [], repository: 'test', style: '' })
    await expect(repository.checkEnv()).rejects.toMatchObject({ msg: 'env nodesss does not exist' })
  })

  test('checkPackage should be right', async () => {
    let repository = await Repository.init('vue', testConfigObj)

    repository = await Repository.init('test', { category: {}, env: [], package: [{ name: 'vue', version: '2.6.10' }], repository: 'test', style: '' })
    await expect(repository.checkPackage()).rejects.toMatchObject({ msg: 'package vue does not exist' })

    repository = await Repository.init('test', { category: {}, env: [], package: [{ name: 'jest', version: '2.6.10' }], repository: 'test', style: '' })
    await expect(repository.checkPackage()).resolves.not.toThrow()

    repository = await Repository.init('test', { category: {}, env: [], package: [{ name: 'jest', version: '211.6.10' }], repository: 'test', style: '' })
    await expect(repository.checkPackage()).rejects.toMatchObject({ msg: 'package jest version is wrong' })
  })

  test('record should be right', async () => {
    const repository = await Repository.init('vue', testConfigObj)

    const row: recordRow = ['row1', 'row1', 'row1', 'row1', 'row1', 'row1', 'row1']
    await expect(repository.record(row)).resolves.not.toThrow()
    expect(historyIns).toBeCalledTimes(1)
    expect(StorageMock.commit).toBeCalled()
  })

  test('searchMaterial should be right', async () => {
    const repository = await Repository.init('vue', testConfigObj)

    await expect(repository.searchMaterial('', '')).resolves.not.toThrow()
    expect(historySearch).toBeCalledWith({ name: '', category: '' })
  })

  test('update should be right', async () => {
    const repository = await Repository.init('test', testConfigObj)

    await expect(repository.update()).resolves.not.toThrow()
    expect(StorageMock.fetch).toBeCalledTimes(1)
    expect(StorageMock.checkout).toBeCalledWith([testFile, 'historyFile'])
  })

  test('find should be right', async () => {
    const repository = await Repository.init('vue', testConfigObj)
    repository.searchMaterial = jest.fn().mockResolvedValue([])
    await expect(repository.find('', '')).resolves.toBe(null)
    expect(repository.searchMaterial).toBeCalledWith('', '')
    expect(History.transform).not.toBeCalled()

    repository.searchMaterial = jest.fn().mockResolvedValue([[]])
    Material.parse = jest.fn().mockReturnValue(null)
    await expect(repository.find('', '')).resolves.toBe(null)
    expect(History.transform).toBeCalled()
    expect(Material.parse).toBeCalledWith('1')

    Material.parse = jest.fn().mockReturnValue({})
    await expect(repository.find('', '')).resolves.toBeInstanceOf(Material)
  })
})

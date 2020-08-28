import path from 'path'
import fs from 'fs-extra'
import Repository from '../src/repository'
import Material from '../src/material'
import { DEFAULT_MATERIAL_CONFIG_NAME, SOURCE_DIR } from '../src/constant'

import Storage from '../src/storage'

jest.mock('../src/storage')
jest.mock('../src/repository')

const testConfigFile = path.resolve(__dirname, '../../../example/material.toml')

const testConfigObj = {
  author: '',
  category: 'component',
  description: '',
  name: '',
  inject: '',
  package: [
    { name: 'vue', version: '2.6.10' },
    { name: 'ant-design-vue', version: '1.4.12' }
  ],
  repository: 'vue',
  tags: [],
  var: [
    { name: '', path: 'style/theme.less', type: 'less' },
    { name: 'api', path: 'api/index.js', type: 'js' }
  ]
}

const testDir = path.resolve(__dirname, 'test_storage__')
const testFile = path.resolve(testDir, DEFAULT_MATERIAL_CONFIG_NAME)

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

const RepositoryMock = ({
  configFile: path.resolve(__dirname, './test.toml'),
  repositoryName: 'test',
  getConfig: jest.fn().mockReturnValue({}),
  update: jest.fn(),
  searchMaterial: jest.fn().mockResolvedValue([]).mockResolvedValueOnce([[]]),
  record: jest.fn(),
  checkEnv: jest.fn()
} as unknown) as Repository

const storage = jest.fn().mockReturnValue(StorageMock)

beforeAll(() => {
  Storage.storage = storage
})

describe('Material static method should be right', () => {
  test('parse shoule be right', () => {
    expect(Material.parse(testDir)).toBeNull()
    fs.copySync(testConfigFile, testFile)
    expect(Material.parse(testDir)).toEqual(testConfigObj)
    fs.removeSync(testFile)
  })

  test('init should be right', async () => {
    const RepositoryFindFn = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValue(RepositoryMock)
    Repository.find = RepositoryFindFn
    await expect(Material.init(testConfigObj)).resolves.toBeNull()
    await expect(Material.init(testConfigObj)).resolves.toBeInstanceOf(Material)
  })
})

describe('Material method should be right', () => {
  let material: Material
  beforeAll(() => {
    material = new Material(RepositoryMock, testConfigObj)
  })

  test('checkExist should be right', async () => {
    await expect(material.checkExist()).resolves.toBe(true)
    await expect(material.checkExist()).resolves.toBe(false)
    expect(RepositoryMock.update).toBeCalledTimes(2)
    expect(RepositoryMock.searchMaterial).toBeCalledTimes(2)
  })

  test('checkDir should be right', async () => {
    RepositoryMock.getConfig = jest
      .fn()
      .mockReturnValueOnce({ category: {} })
      .mockReturnValue({
        category: {
          component: {
            dir: ['test', 'test1']
          }
        }
      })
    await expect(material.checkDir([''])).rejects.toThrowError(
      /does not exist in repository/
    )
    expect(RepositoryMock.getConfig).toBeCalled()
    await expect(material.checkDir([''])).rejects.toEqual({
      raw: ['test', 'test1'],
      msg: 'dir does not match'
    })
    await expect(material.checkDir(['test', 'test1'])).resolves.toBeUndefined()
    await expect(
      material.checkDir(['test', 'test1', 'sss'])
    ).resolves.toBeUndefined()
  })

  test('checkField should be right', async () => {
    const injectCache = testConfigObj.inject
    delete testConfigObj.inject

    RepositoryMock.getConfig = jest
      .fn()
      .mockReturnValueOnce({ category: {} })
      .mockReturnValueOnce({
        category: {
          component: {}
        }
      })
      .mockReturnValueOnce({
        category: {
          component: {
            checklist: {}
          }
        }
      })
      .mockReturnValue({
        category: {
          component: {
            checklist: {
              inject: true
            }
          }
        }
      })
    await expect(material.checkField()).rejects.toThrowError(
      /does not exist in repository/
    )
    await expect(material.checkField()).resolves.toBeUndefined()
    await expect(material.checkField()).resolves.toBeUndefined()
    await expect(material.checkField()).rejects.toEqual({
      raw: ['inject'],
      msg: 'checklist is not passed'
    })
    expect(RepositoryMock.getConfig).toBeCalledTimes(4)
    testConfigObj.inject = injectCache
  })

  test('checkPackage should be right', async () => {
    RepositoryMock.checkPackage = jest.fn()
    const packageCache = testConfigObj.package

    delete testConfigObj.package
    await expect(material.checkPackage()).resolves.toBeUndefined()
    expect(RepositoryMock.checkPackage).toBeCalledTimes(1)

    testConfigObj.package = [
      {
        name: 'jest',
        version: '0.0.1'
      }
    ]
    await expect(material.checkPackage()).resolves.toBeUndefined()

    testConfigObj.package = packageCache
    await expect(material.checkPackage()).rejects.toEqual({
      msg: 'package vue does not exist',
      raw: ['vue']
    })
  })

  test('getDir should be right', async () => {
    await expect(material.getDir()).resolves.toBe(
      path.resolve(testDir, 'vue/@component.e3b0c442')
    )
    expect(Storage.storage).toBeCalledTimes(1)
    await material.getDir()
    expect(Storage.storage).toBeCalledTimes(1)
  })

  test('genConfig should be right', async () => {
    await expect(material.genConfig()).resolves.toMatch('info.toml')
    expect(Storage.storage).toBeCalledTimes(1)
    fs.removeSync(testDir)
  })

  test('submitCheck should be right', async () => {
    material.checkField = jest.fn().mockResolvedValue('')
    material.checkDir = jest.fn().mockResolvedValue('')
    await expect(material.submitCheck([])).resolves.not.toThrow()
    expect(material.checkField).toBeCalledTimes(1)
    expect(material.checkDir).toBeCalledTimes(1)
  })

  test('submit should be right', async () => {
    material.submitCheck = jest.fn().mockResolvedValue('')
    material.genConfig = jest.fn().mockResolvedValue('')
    const srctestDir = path.resolve(testDir, 'srctest')
    fs.ensureDirSync(srctestDir)

    await expect(material.submit(srctestDir)).resolves.not.toThrow()
    expect(material.submitCheck).toBeCalledWith([])
    expect(material.genConfig).toBeCalledTimes(1)
    expect(StorageMock.commit).toBeCalledWith([], 'Update  for vue repository')
    expect(RepositoryMock.record).toBeCalledTimes(1)

    fs.removeSync(testDir)
  })

  test('submitFile should be right', async () => {
    material.submitCheck = jest.fn().mockResolvedValue('')
    material.genConfig = jest.fn().mockResolvedValue('')
    const dirTest = path.resolve(testDir, 'test_dir')
    material.getDir = jest.fn().mockResolvedValue(dirTest)

    const srcTestFile1 = path.resolve(testDir, 'test/test1.test')
    const srcTestFile2 = path.resolve(testDir, 'test/test1/test.test')

    const dirTestFile1 = path.resolve(dirTest, SOURCE_DIR, 'test1.test')
    const dirTestFile2 = path.resolve(dirTest, SOURCE_DIR, 'test1/test.test')

    fs.ensureFileSync(srcTestFile1)
    fs.ensureFileSync(srcTestFile2)

    await expect(
      material.submitFile([srcTestFile1, srcTestFile2])
    ).resolves.not.toThrow()

    expect(material.submitCheck).toBeCalledWith([
      'test1.test',
      'test1/test.test'
    ])
    expect(material.genConfig).toBeCalledTimes(1)
    expect(StorageMock.commit).toBeCalledWith(
      [dirTestFile1, dirTestFile2, ''],
      'Update  for vue repository'
    )
    expect(RepositoryMock.record).toBeCalledTimes(2)

    fs.removeSync(testDir)
  })

  test('pick should be right', async () => {
    const dirFile = path.resolve(testDir, 'dir_test', SOURCE_DIR, 'test/1.test')
    fs.ensureFileSync(dirFile)

    material.checkPackage = jest.fn().mockResolvedValue('')
    material.getDir = jest
      .fn()
      .mockResolvedValue(path.resolve(testDir, 'dir_test'))

    const src = path.resolve(testDir, 'dir_src')

    await expect(material.pick(src)).resolves.not.toThrow()
    expect(fs.pathExistsSync(path.resolve(src, 'test/1.test'))).toBe(true)
    fs.removeSync(testDir)
  })
})

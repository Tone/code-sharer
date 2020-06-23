import fs from 'fs-extra'
import path from 'path'

import Storage from '../src/storage'
import { REMOTE_NAME, DEFAULT_BRANCH } from '../src/constant'
const testDir = path.resolve(__dirname, 'test_storage')

function clear() {
  fs.removeSync(testDir)
}

describe('storage init should be right', () => {
  test('clone remote should be right', async () => {
    jest.resetModules()
    jest.doMock('simple-git/promise', () => {
      return () => {
        return {
          clone: async () => await Promise.resolve()
        }
      }
    })
    const { default: Storage } = await import('../src/storage')
    await expect(Storage.clone('', testDir)).resolves.toBeInstanceOf(Storage)
    expect(fs.existsSync(testDir)).toBe(true)
    clear()
  })
  test('find storage should be right', async () => {
    const storage = await Storage.discover(testDir)
    expect(storage).toBeInstanceOf(Storage)
    expect(fs.existsSync(testDir)).toBe(true)
    clear()
  })
  test('init storage should be right', async () => {
    expect(Storage.storage).toThrow(
      /Storage does not init, please run init first/
    )
    const storage = await Storage.init(testDir)
    expect(storage).toBeInstanceOf(Storage)
    expect(fs.existsSync(testDir)).toBe(true)
    expect(Storage.storage).not.toBeNull()
    clear()
  })

  test('check should be right', async () => {
    jest.resetModules()
    const checkIsRepo = jest
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValue(true)
    jest.doMock('simple-git/promise', () => {
      return () => {
        return {
          checkIsRepo
        }
      }
    })
    const { default: Storage } = await import('../src/storage')

    await expect(Storage.check(testDir)).rejects.toThrow(/does not exist/)
    fs.mkdirSync(testDir)
    await expect(Storage.check(testDir)).rejects.toThrow(/does not init/)
    await expect(Storage.check(testDir)).resolves.toBeUndefined()
    expect(checkIsRepo).toBeCalledTimes(2)
    clear()
  })
})

describe('storage method should be  right', () => {
  let storage: Storage
  let StorageMock: typeof Storage
  const mockFn = {
    checkIsRepo: jest.fn().mockResolvedValue(true),
    add: jest.fn(),
    commit: jest.fn().mockResolvedValue({ commit: 'sss' }),
    fetch: jest.fn(),
    push: jest.fn(),
    pull: jest.fn(),
    log: jest.fn().mockResolvedValue({ all: [{}, { hash: 'nextHash' }] }),
    listConfig: jest
      .fn()
      .mockResolvedValue({ all: { 'user.name': 't', 'user.email': 't' } }),
    checkout: jest.fn()
  }

  beforeAll(async () => {
    jest.resetModules()
    jest.doMock('simple-git/promise', () => {
      return () => {
        return mockFn
      }
    })
    const { default: Storage } = await import('../src/storage')
    StorageMock = Storage
    await Storage.init(testDir)
    storage = Storage.storage()
  })
  afterAll(clear)

  test('commit should be right', async () => {
    await expect(storage.commit([], '')).resolves.toBe('sss')
    expect(mockFn.add).toBeCalledWith([])
    expect(mockFn.commit).toBeCalledWith('', [])
  })
  test('fetch should be right', async () => {
    await expect(storage.fetch()).resolves.toBeInstanceOf(StorageMock)
    expect(mockFn.fetch).toBeCalledWith(REMOTE_NAME)
    await expect(storage.fetch('')).resolves.toBeInstanceOf(StorageMock)
    expect(mockFn.fetch).toBeCalledWith('')
  })
  test('checkout should be right', async () => {
    await expect(storage.checkout([])).resolves.toBeInstanceOf(StorageMock)
    expect(mockFn.checkout).toBeCalledWith([`${REMOTE_NAME}/${DEFAULT_BRANCH}`])
    await expect(storage.checkout([''], '', '')).resolves.toBeInstanceOf(
      StorageMock
    )
    expect(mockFn.checkout).toBeCalledWith([
      `${REMOTE_NAME}/${DEFAULT_BRANCH}`,
      ''
    ])
    await expect(
      storage.checkout(['s', 's'], 's', 's')
    ).resolves.toBeInstanceOf(StorageMock)
    expect(mockFn.checkout).toBeCalledWith(['s/s', 's', 's'])
  })
  test('push should be right', async () => {
    await expect(storage.push()).resolves.toBeInstanceOf(StorageMock)
    expect(mockFn.push).toBeCalledWith(REMOTE_NAME, DEFAULT_BRANCH)
    expect(mockFn.pull).toBeCalledWith(REMOTE_NAME, DEFAULT_BRANCH, ['-r'])

    await expect(storage.push('s', 's')).resolves.toBeInstanceOf(StorageMock)
    expect(mockFn.log).toBeCalledTimes(1)
    expect(mockFn.push).toBeCalledWith('s', 'nextHash:master')
    await expect(storage.push('hash', 'r', 'b')).resolves.toBeInstanceOf(
      StorageMock
    )
    expect(mockFn.push).toBeCalledWith('r', 'nextHash:b')
  })
  test('config should be right', async () => {
    await expect(storage.config('s')).resolves.toBeUndefined()
    expect(mockFn.listConfig).toBeCalled()
  })
  test('author should be right', async () => {
    await expect(storage.author()).resolves.toBe('t <t>')
    mockFn.listConfig.mockResolvedValueOnce({ all: { name: 0, email: 't' } })
    await expect(storage.author()).resolves.toBe('')
  })
})

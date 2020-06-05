import { mocked } from 'ts-jest/utils'
import fs from 'fs-extra'
import path from 'path'

import History from '../src/history'
import Repository from '../src/repository'

jest.mock('../src/repository')

beforeAll(() => {
  mocked(Repository).mockImplementation(() => {
    return { configFile: path.resolve(__dirname, './test.toml'), repositoryName: 'test' } as const as Repository
  })
})
const historyFileTemplate = `00|01|02
10|11|12
20|11|22`

const testCSV = path.resolve(__dirname, './test.csv')

function genTestFile() {
  fs.outputFileSync(testCSV, historyFileTemplate)
}

function clear() {
  fs.removeSync(testCSV)
}

describe('History static method init should be exec right', () => {
  test('record file does not exist', async () => {
    await expect(History.init(new Repository(''))).resolves.toEqual({ historyFile: testCSV, records: [] })
    expect(fs.existsSync(testCSV)).toBe(true)
    clear()
  })

  test('permission denied record file parse error', async () => {
    fs.outputFileSync(testCSV, '', { mode: 0o333 })
    await expect(History.init(new Repository(''))).rejects.toThrow(/permission denied/)
    fs.removeSync(testCSV)
  })

  test('record file parse error', async () => {
    fs.outputFileSync(testCSV, `testKey | testKey
    testKey`)
    await expect(History.init(new Repository(''))).rejects.toThrow()
    fs.removeSync(testCSV)
  })

  test('empty record file parse right', async () => {
    fs.outputFileSync(testCSV, '')
    await expect(History.init(new Repository(''))).resolves.toEqual({ historyFile: testCSV, records: [] })
    fs.removeSync(testCSV)
  })

  test('record file parse right', async () => {
    fs.outputFileSync(testCSV, 'testKey1|testKey2|')
    await expect(History.init(new Repository(''))).resolves.toHaveProperty('records', [['testKey1', 'testKey2', '']])
    fs.removeSync(testCSV)
  })

  test('transform file parse right', () => {
    expect(History.transform(['1', '2', '3', '1', '2', '3', '1', 1, 2])).toEqual({
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
})

describe('record file is existing', () => {
  beforeEach(genTestFile)

  test('record search should be right', async () => {
    const history = await History.init(new Repository(''))
    expect(history.search({ name: '00', category: '01' })).toEqual([['00', '01', '02']])
    expect(history.search({ category: '11' })).toEqual([['10', '11', '12'], ['20', '11', '22']])
    expect(history.search({ name: '30' })).toEqual([])
  })

  test('record insert should be right', async () => {
    const history = await History.init(new Repository(''))
    await history.insert(['row1', 'row1', 'row1', 'row1', 'row1', 'row1', 'row1'])
    expect(fs.readFileSync(testCSV).toString()).toEqual(expect.stringContaining('row1|row1|row1|row1|row1|row1|row1')
    )
  })

  afterEach(clear)
})

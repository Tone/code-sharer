import { parse, stringify } from '../src/utils'
import { DEFAULT_NAME_STYLE } from '../src/constant'

const parseObj = [
  { key: 'name', match: '[name]' },
  { key: 'category', match: '[category]' },
  { hash: 8, key: 'author', match: '[author:8]' }
]

const key = {
  name: 'ss',
  category: 'sss',
  author: '111'
}

describe('parse name style', () => {
  test('parse default name style ', () => {
    expect(parse(DEFAULT_NAME_STYLE)).toEqual(parseObj)
  })

  test('parse custom name style ', () => {
    expect(parse('[name]_[category:]')).toEqual([
      { key: 'name', match: '[name]' }
    ])
  })

  test('parse custom name style when hash is negative ', () => {
    expect(parse('[name]_[category:-2]')).toEqual([
      { key: 'name', match: '[name]' },
      { hash: -2, key: 'category', match: '[category:-2]' }
    ])
  })
})

describe('stringify name', () => {
  test('stringify default name style', () => {
    expect(stringify(DEFAULT_NAME_STYLE, key)).toEqual('ss@sss.f6e0a1e2')
  })

  test('parse custom name style', () => {
    expect(stringify('[name]_[category:0]', key)).toEqual('ss_sss')
  })
})

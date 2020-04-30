import path from 'path'
import stringify from 'csv-stringify'
import parse from 'csv-parse'
import fs from 'fs-extra'

import Repository from './repository'
import { HISTORY_RECORD_EXT, HISTORY_RECORD_CSV_OPTION } from './constant'

interface RepositoryCSV {
  name: string,
  category: string,
  author: string,
  commitID: string,
  tags: string,
  description: string,
  dir: string,
  ctm: number,
  mtm: number
}

type record = [
  RepositoryCSV['name'],
  RepositoryCSV['category'],
  RepositoryCSV['author'],
  RepositoryCSV['commitID'],
  RepositoryCSV['tags'],
  RepositoryCSV['description'],
  RepositoryCSV['dir'],
  RepositoryCSV['ctm'],
  RepositoryCSV['mtm']
]

export type recordRow = [
  RepositoryCSV['name'],
  RepositoryCSV['category'],
  RepositoryCSV['author'],
  RepositoryCSV['commitID'],
  RepositoryCSV['tags'],
  RepositoryCSV['description'],
  RepositoryCSV['dir'],
]

const recordKey = ['name', 'category', 'author', 'commitID', 'tags', 'description', 'dir', 'ctm', 'mtm']

export default class History {
  static async init(repository: Repository) {
    const historyFile = path.resolve(path.dirname(repository.configFile), repository.repositoryName + HISTORY_RECORD_EXT)
    const records = await this.read(historyFile)
    return new History(historyFile, records)
  }

  private static async read(historyFile: string) {
    await fs.ensureFile(historyFile)
    const content = await fs.readFile(historyFile)
    // TODO change to stream
    const records = await new Promise((resolve, reject) => parse(content, HISTORY_RECORD_CSV_OPTION, function (err, output) {
      if (err !== undefined) reject(err)
      resolve(output)
    }))

    return records as record[]
  }

  readonly historyFile: string
  private readonly records: record[]

  constructor(historyFile: string, records: record[]) {
    this.historyFile = historyFile
    this.records = records
  }

  private async write() {
    // TODO change to stream
    const str = await new Promise((resolve, reject) => {
      stringify(this.records, HISTORY_RECORD_CSV_OPTION, function (err, output) {
        if (err !== undefined) reject(err)
        resolve(output)
      })
    })
    await fs.writeFile(this.historyFile, str)
  }

  statistics() {
    // TODO
    return this
  }

  async insert(record: recordRow) {
    const now = Date.now()
    const row = [...record, now, now] as record
    this.records.unshift(row)
    await this.write()
    return this
  }

  private include<T>(src: T, target: T) {
    if (typeof src === 'string' && typeof target === 'string') {
      return src.includes(target)
    } else {
      return this.equal(src, target)
    }
  }

  private equal<T>(src: T, target: T) {
    return src === target
  }

  search(key: Partial<RepositoryCSV>) {
    const keys = Object.keys(key) as Array<keyof typeof key>

    return this.records.filter(record => {
      return keys.every(k => this.include(record[recordKey.indexOf(k)], key[k]))
    })
  }
}

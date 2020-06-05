import shell from 'shelljs'
import semver from 'semver'

import { Env, Package } from './config'
type command = (...args: any) => Promise<any>

let npmPackageCache = ''

// TODO change error interface extends Error
interface DetectorErr {
  msg: string,
  raw: string[]
}

export enum DetectorType {
  env,
  dir,
  npm,
  checklist,
  package,
  version
}

type exec = command | string | [command, string | DetectorType]

interface DetectorExec {
  [type: string]: exec
}

interface Checklist {
  [name: string]: boolean
}

interface CheckSrc {
  [name: string]: any
}

export default abstract class Detector {
  private detector: DetectorExec

  static builtInDetector: DetectorExec = {
    [DetectorType.env]: Detector.env,
    [DetectorType.dir]: Detector.dir,
    [DetectorType.checklist]: Detector.checklist,
    [DetectorType.package]: [Detector.package, DetectorType.npm],
    [DetectorType.version]: Detector.version,
    [DetectorType.npm]: Detector.npm
  }

  // TODO need cache env
  private static async env(env: Env[]) {
    const valid = []
    for (const e of env) {
      const { code, stdout: version } = shell.exec(`${e.exec} --version`, { silent: true })
      if (code !== 0) {
        const err: DetectorErr = {
          msg: `env ${e.exec} does not exist`,
          raw: [e.exec]
        }
        return await Promise.reject(err)
      }
      if (version !== '') {
        const versionValid = await Detector.version(version, e.version)
        if (!versionValid) {
          const err: DetectorErr = {
            msg: `env ${e.exec} version is wrong`,
            raw: [e.version, version]
          }
          return await Promise.reject(err)
        }
      }
      valid.push(e)
    }

    return await Promise.resolve()
  }

  private static async dir(src: string[], match: string[]) {
    const failure = []

    for (const m of match) {
      if (!src.includes(m)) {
        failure.push(m)
      }
    }
    if (failure.length !== 0) {
      const err: DetectorErr = {
        msg: 'dir does not match',
        raw: failure
      }
      return await Promise.reject(err)
    }
    return await Promise.resolve()
  }

  private static async checklist(checklist: Checklist, checkSrc: CheckSrc) {
    const checkKey = Object.keys(checklist)

    if (checkKey.length === 0) return

    const failure = []

    for (const k of checkKey) {
      if (checklist[k] && checkSrc[k] === undefined) {
        failure.push(k)
      }
    }
    if (failure.length !== 0) {
      const err: DetectorErr = {
        msg: 'checklist is not passed',
        raw: failure
      }
      return await Promise.reject(err)
    }
  }

  // TODO need cache package
  private static async package(packages: Package[], exec: command) {
    for (const p of packages) {
      try {
        const version: string = await exec(p.name)
        if (p.version !== '' && version !== '') {
          const versionValid = await Detector.version(version, p.version)
          if (!versionValid) {
            const err: DetectorErr = {
              msg: `package ${p.name} version is wrong`,
              raw: [p.version, version]
            }
            return await Promise.reject(err)
          }
        }
      } catch (e) {
        return await Promise.reject(e)
      }
    }

    return await Promise.resolve()
  }

  private static async npm(p: string) {
    if (npmPackageCache === '') {
      npmPackageCache = shell.exec('npm list --depth=0', { silent: true }).stdout
    }
    const regEx = new RegExp(`${p}@.+$`, 'm')
    const match = npmPackageCache.match(regEx)
    const valid = match === null ? '' : match[0]

    if (valid === '') {
      const err = {
        msg: `package ${p} does not exist`,
        raw: [p]
      }
      return await Promise.reject(err)
    }
    const version = valid.split('@')
    return await Promise.resolve(version[version.length - 1])
  }

  private static async version(exist: string, expect: string): Promise<boolean> {
    const existV = semver.coerce(exist)
    const expectV = semver.coerce(expect)
    let valid = true
    if (existV !== null && expectV !== null) {
      valid = semver.gte(existV, expectV)
    }
    return await Promise.resolve(valid)
  }

  constructor() {
    this.detector = Detector.builtInDetector
  }

  getDetectorByType(type: string | DetectorType) {
    const detector = this.detector[type]

    if (typeof detector === 'string') {
      return () => shell.exec(detector, { silent: true }).code === 0
    } else if (typeof detector === 'function') {
      return detector
    } else if (typeof this.detector[detector[1]] === 'function') {
      return async (...arg: any) => await detector[0](...arg, this.detector[detector[1]])
    }
    return detector[0]
  }

  registerDetector(type: string | DetectorType, exec: exec) {
    this.detector[type] = exec
  }
}

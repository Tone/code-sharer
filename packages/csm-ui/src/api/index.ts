import { message } from 'antd'
import { Info } from '../interface'

const ERR_NAME = 'RES_ERROR'

class ResErr extends Error {
  code: number
  constructor(code: number, msg: string) {
    super(msg)
    this.name = ERR_NAME
    this.code = code
  }
}

async function fetcher(...args: any[]) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore: Unreachable code error
  const res = await fetch(...args)

  if (res.status > 300) {
    let errText = res.statusText
    try {
      const { msg, message } = await res.json()
      errText = msg ?? message ?? res.statusText
      message.error(`${ERR_NAME}(${res.status}):${errText}`)
      throw new ResErr(res.status, errText)
    } catch {
      message.error(`${ERR_NAME}(${res.status}):${errText}`)
      throw new ResErr(res.status, errText)
    }
  }
  return await res.json()
}

export async function download({ name, category, url }: Info, dest: string) {
  await fetcher(`/api/material?s=${url}&n=${name}&c=${category}&d=${dest}`, {
      method: 'GET'
  })
}

export async function refresh(url?: string): Promise<Array<{
  url: string,
  material: Info[]
}>> {
  return await fetcher(`/api/material?s=${url ?? ''}`, {
    method: 'POST'
  })
}

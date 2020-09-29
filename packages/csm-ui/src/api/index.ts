import { message } from 'antd'

class ResErr extends Error {
  code: number
  constructor(code: number, msg: string) {
    super(msg)
    this.name = 'RES_ERROR'
    this.code = code
  }
}

async function fetcher(...args: any[]) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore: Unreachable code error
  const res = await fetch(...args)
  if (res.status > 300) {
    const { msg, message } = await res.json()
    const errText = msg ?? message ?? res.statusText

    throw new ResErr(res.status, errText)
  }
  return await res.json()
}

export async function download(name: string, category: string, dest: string) {
  try {
    await fetcher(`/api/material?n=${name}&c=${category}&d=${dest}`, {
      method: 'GET'
    })
  } catch (error) {
    message.error(`${error.name}(${error.code}):${error.message}`)
  }
}

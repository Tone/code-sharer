import useSWR from 'swr'
import { useSetRecoilState } from 'recoil'
import { messageState } from './store'

class ResErr extends Error {
  code: number
  constructor(code: number, msg: string) {
    super(msg)
    this.name = 'RES_ERROR'
    this.code = code
  }
}

export async function fetcher(...args: any[]) {
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

function useFetch(api: any) {
  const setMessage = useSetRecoilState(messageState)
  const { data, error } = useSWR(api, fetcher, { shouldRetryOnError: false })
  if (error?.code !== undefined) {
    setMessage(`${error.name}(${error.code}):
     ${error.message}
    `)
    return
  }

  return data
}

export default useFetch

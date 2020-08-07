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

async function fetcher(...args: any[]) {
  // @ts-ignore: Unreachable code error
  const res = await fetch(...args)
  if (res.status > 300) {
    throw (new ResErr(res.status, res.statusText))
  }
  return await res.json()
}

function useFetch(api: string) {
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

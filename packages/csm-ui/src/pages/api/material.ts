import { NextApiRequest, NextApiResponse } from 'next'
import { currentExecDir } from '../../service/config'
import path from 'path'

import Store from '../../service'
const { store } = Store

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (store === null) {
    res.status(500).send({ msg: 'store does not init' })
    return
  }

  const {
    query: { c, n, d }
  } = req
  if (
    c === '' || c === undefined ||
    n === '' || n === undefined ||
    d === '' || d === undefined ||
    Array.isArray(c) ||
    Array.isArray(n) ||
    Array.isArray(d)
  ) {
    res.status(400).send(null)
    return
  }

  try {
    await store.download(n, c, path.join(currentExecDir, d))
    res.status(200).send({})
  } catch (e) {
    res.status(500).send(e)
  }
}

import { NextApiRequest, NextApiResponse } from 'next'
import { currentExecDir } from '../../service/config'
import path from 'path'
import Store from '../../service'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const store = await Store.init()

  if (store === null) {
    res.status(500).send({ msg: 'store does not init' })
    return
  }

  const { method } = req

  switch (method) {
    case 'GET': {
      const {
        query: { s, c, n, d }
      } = req
      if (
        s === '' || s === undefined || Array.isArray(s) ||
        c === '' || c === undefined || Array.isArray(c) ||
        n === '' || n === undefined || Array.isArray(n) ||
        d === '' || d === undefined || Array.isArray(d)
      ) {
        res.status(400).send(null)
        return
      }

      try {
        await store.download(s, c, n, path.join(currentExecDir, d))
        res.status(200).send({})
      } catch (e) {
        res.status(500).send(e)
      }
      break
    }
    case 'POST': {
      try {
        const repos = await store.refreshAll()
        res.status(200).send(repos)
      } catch (e) {
        res.status(500).send(e)
      }
      break
    }
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

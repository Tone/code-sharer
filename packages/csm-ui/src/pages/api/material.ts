import { NextApiRequest, NextApiResponse } from 'next'
import store from '../../service'
import path from 'path'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { r, c, n, d }
  } = req
  if (
    r === '' || r === undefined ||
    c === '' || c === undefined ||
    n === '' || n === undefined ||
    Array.isArray(r) ||
    Array.isArray(c) ||
    Array.isArray(n)
  ) {
    res.status(400).send(null)
    return
  }

  try {
    const material = await store.findMaterial(r, c, n)

    if (material === null) {
      res.status(500).send({ msg: 'material does not exist' })
      return
    }
    await material.pick(path.join(process.cwd(), d as string))
    res.status(200).send({})
  } catch (e) {
    res.status(500).send(e)
  }
}

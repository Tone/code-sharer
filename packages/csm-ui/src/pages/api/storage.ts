import { NextApiRequest, NextApiResponse } from 'next'
import store from '../../service'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { s },
  } = req

  if (Array.isArray(s)) {
    res.status(400).send(null)
    return
  }

  try {
    if (s) {
      await store.refresh(s)
    } else {
      await store.init(false)
    }
    res.status(200).json({})
  } catch (e) {
    res.status(500).send(e)
  }
}

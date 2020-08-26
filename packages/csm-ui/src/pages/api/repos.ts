import { NextApiRequest, NextApiResponse } from 'next'
import store from '../../service'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { s },
  } = req

  if (!s || Array.isArray(s)) {
    res.status(400).send(null)
    return
  }

  try {
    const { repository } = await store.parseRepo(s)
    const reposArr = Object.values(repository).map(r => r.getConfig())
    res.status(200).json(reposArr)
  } catch (e) {
    res.status(500).send(e)
  }
}

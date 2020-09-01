import { NextApiRequest, NextApiResponse } from 'next'
import store from '../../../service'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { name, category }
  } = req

  if (
    name === '' || name === undefined ||
    category === '' || category === undefined ||
    Array.isArray(name) ||
    Array.isArray(category)
  ) {
    res.status(400)
    return
  }

  try {
    const materials = await store.getMaterials(name, category)

    const newest: Record<string, any> = {}

    materials.forEach((m) => {
      if (newest[m.name] === undefined) {
        newest[m.name] = {
          ...m,
          tags: m.tags.split(',').filter((t) => t !== '')
        }
      } else if (+newest[m.name].ctm < +m.ctm) {
        newest[m.name] = {
          ...m,
          tags: m.tags.split(',').filter((t) => t !== '')
        }
      }
    })

    res.status(200).json(Object.values(newest))
  } catch (e) {
    res.status(500).send(e)
  }
}

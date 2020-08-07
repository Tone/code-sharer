import { NextApiRequest, NextApiResponse } from 'next'


import { materials } from '../../../mock'

export default (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { name, category },
    method,
  } = req

  switch (method) {
    case 'GET':
      // Get data from your database
      res.status(200).json({
        name, category, description: '在中台产品的研发过程中，会出现不同的设计规范和实现方式，但其中往往存在很多类似的页面和组件，这些类似的组件会被抽离成一套标准规范。', materials: materials.materials
      })
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

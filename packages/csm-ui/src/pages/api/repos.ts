import { NextApiRequest, NextApiResponse } from 'next'

export default (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json([
    {
      repository: 'test',
      env: [{
        name: 'e1',
        version: 'v1'
      }, {
        name: 'e2',
        version: 'v2'
      }, {
        name: 'e3',
        version: 'v3'
      }],
      package: [
        {
          name: 'p1',
          version: 'v1'
        },
        {
          name: 'p2',
          version: 'v2'
        },
        {
          name: 'p3',
          version: 'v3'
        }
      ],
      category: [{
        name: 'c1',
        version: 'v3',
        position: 'p1'
      },
      {
        name: 'c2',
        version: 'v3',
        position: 'p1'
      },
      {
        name: 'c3',
        version: 'v3',
        position: 'p1'
      }]
    },
    {
      repository: 'test1',
      env: [{
        name: '1e1',
        version: '1v1'
      }, {
        name: '1e2',
        version: '1v2'
      }, {
        name: '1e3',
        version: '1v3'
      }],
      package: [
        {
          name: '1p1',
          version: '1v1'
        },
        {
          name: '1p2',
          version: '1v2'
        },
        {
          name: '1p3',
          version: '1v3'
        }
      ],
      category: [{
        name: '1c1',
        version: '1v3'
      },
      {
        name: '1c2',
        version: '1v3'
      },
      {
        name: '1c3',
        version: '1v3'
      }]
    },
  ])
}

import Mock from 'mockjs'


export const materials = Mock.mock({
  "materials|20-100": [
    {
      "name|+1": "@string(5)",
      "tags|1-2": ["@string(1)"],
      "description": "@sentence(5)",
      "author": "@cname <@email()>"
    }
  ]
})

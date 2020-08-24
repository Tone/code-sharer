import Mock from 'mockjs'


export const materials = Mock.mock({
  "materials|20-100": [
    {
      "name": '@string(2)',
      "tags|1-1": ["test", "test1", "test2", "test13", "test212", "test1212"],
      "description": "@sentence(5)",
      "author": "@cname <@email()>"
    }
  ]
})

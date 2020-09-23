var fs = require('fs-extra')
var path = require('path')
var name = process.argv[process.argv.indexOf('create') + 1]

module.exports = (api) => {
  api.extendPackage({
    csmConfig: {
      category: 'component'
    },
    files: ['src/**/*', '!src/main.js']
  })
  api.render('./template', { name })
  api.onCreateComplete(() => {
    fs.removeSync(path.join(process.cwd(), name, 'src/App.vue'))
  })
}

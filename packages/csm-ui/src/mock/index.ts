import { mock } from 'mockjs'

export const repos = mock([
  {
    url: 'git@github.com:Tone/csm-storage.git',
    'material|30-124': [
      {
        name: '@word(4,12)',
        'category|1': ['component', 'block', 'page'],
        description: '@paragraph(1)',
        dependencies: {
          'core-js': '^3.6.5',
          vue: '^2.6.11'
        },
        'keywords|2-8': ['@word(4,6)'],
        code: `(num) => num + 1
        (num) => num + 1
        (num) => num + 1`,
        files: [
          'src/**/*',
          '!src/main.js'
        ],
        url: 'git@github.com:Tone/csm-storage.git'
      }
    ]
  },
  {
    url: 'git@github.com:Tone/csm-storage.git2',
    material: [
      {
        name: 'ok',
        category: 'component',
        description: '',
        dependencies: {
          'core-js': '^3.6.5',
          vue: '^2.6.11'
        },
        keywords: [],
        code: '',
        files: [
          'src/**/*',
          '!src/main.js'
        ]
      }
    ]
  }
])

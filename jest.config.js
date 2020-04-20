module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json'
    }
  },
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  testMatch: ['**/__test__/**/*.(ts|js)', '**/?(*.)+(spec|test).[jt]s'],
  testEnvironment: 'node'
}

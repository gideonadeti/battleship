module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  moduleFileExtensions: ['js'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/helpers/', '/__tests__/integration/'],
  testEnvironment: 'jsdom'
}

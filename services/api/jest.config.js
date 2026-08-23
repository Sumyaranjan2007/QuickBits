module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@quickbite/types$': '<rootDir>/../../packages/types/src',
    '^@quickbite/validation$': '<rootDir>/../../packages/validation/src',
    '^@quickbite/config$': '<rootDir>/../../packages/config/src',
  },
};

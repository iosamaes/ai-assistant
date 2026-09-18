module.exports = {
  preset: 'jest-expo',
  rootDir: '.',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*-test.[jt]s?(x)'],
  clearMocks: true,
};

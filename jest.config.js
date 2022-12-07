module.exports = {
  preset: 'jest-preset-angular',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$',
      diagnostics: false,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupJest.ts'],
  fakeTimers: { enableGlobally: true },
  moduleDirectories: ['node_modules', 'src', 'projects'],
  transformIgnorePatterns: ['/node_modules/(?!.*\\.mjs$)'],
};

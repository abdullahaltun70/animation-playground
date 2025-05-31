import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'js5zv2',
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,

    // Disable file watching to prevent automatic re-runs
    watchForFileChanges: false,

    // Test file patterns
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',

    // Support files
    supportFile: 'cypress/support/e2e.ts',

    // Screenshots and videos
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',

    // Fixtures
    fixturesFolder: 'cypress/fixtures',

    // Test isolation - run each test in a clean state
    testIsolation: true,

    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0,
    },

    // Environment variables
    env: {
      // Add any environment-specific variables here
      coverage: false,
    },

    setupNodeEvents(on, config) {
      // implement node event listeners here

      // Code coverage support (optional)
      // require('@cypress/code-coverage/task')(on, config)

      return config;
    },
  },

  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },
});

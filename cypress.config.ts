import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'js5zv2',
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 60000,
    
    // More lenient for CI environments
    experimentalRunAllSpecs: false,
    experimentalInteractiveRunEvents: true,
    
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

    // Retry configuration - more retries in CI
    retries: {
      runMode: 3,
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

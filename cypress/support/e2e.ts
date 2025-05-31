// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add global configurations
beforeEach(() => {
  // Clear localStorage and sessionStorage before each test
  cy.clearLocalStorage();
  cy.clearAllSessionStorage();

  // Set viewport to desktop size by default
  cy.viewport(1280, 720);
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err) => {
  // returning false here prevents Cypress from failing the test
  // You might want to log these exceptions instead
  console.error('Uncaught exception:', err);
  return false;
});

// Add custom assertions or global configurations here
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with test user
       * @example cy.loginAsTestUser()
       */
      loginAsTestUser(): Chainable;

      /**
       * Custom command to wait for page load
       * @example cy.waitForPageLoad()
       */
      waitForPageLoad(): Chainable;

      /**
       * Custom command to wait for animation to complete
       * @example cy.waitForAnimation()
       */
      waitForAnimation(): Chainable;

      /**
       * Custom command to check accessibility
       * @example cy.checkA11y()
       */
      checkA11y(): Chainable;

      /**
       * Custom command for tab navigation
       * @example cy.tab()
       */
      tab(): Chainable;
    }
  }
}

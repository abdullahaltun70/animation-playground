// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/// <reference types="cypress" />

// Custom command for logging in as a test user
Cypress.Commands.add('loginAsTestUser', () => {
  // Visit login page with retry logic for CI
  cy.visit('/login', { timeout: 30000, retryOnNetworkFailure: true });

  // Wait for page to load with extended timeout for CI
  cy.waitForPageLoad();

  // Fill in test credentials using the actual form structure
  cy.get('input[type="email"]', { timeout: 15000 })
    .should('be.visible')
    .clear()
    .type('a.altun70@outlook.com', { delay: 50 });

  cy.get('input[type="password"]', { timeout: 10000 })
    .should('be.visible')
    .clear()
    .type('abdullah', { delay: 50 });

  // Submit login form with retry logic
  cy.get('button[type="submit"]')
    .contains('Sign in')
    .should('be.visible')
    .should('not.be.disabled')
    .click();

  // Wait for redirect to home page with extended timeout
  cy.url({ timeout: 15000 }).should('not.include', '/login');
  cy.waitForPageLoad();
});

// Custom command to wait for page load
Cypress.Commands.add('waitForPageLoad', () => {
  // Ensure the page is interactive
  cy.document().should('have.property', 'readyState', 'complete');

  // Wait a bit longer for any dynamic content to load in CI
  cy.wait(Cypress.env('CI') ? 2000 : 500);

  // Ensure basic page elements are loaded
  cy.get('body').should('be.visible');
});

// Custom command to wait for animations to complete
Cypress.Commands.add('waitForAnimation', () => {
  // Wait for any CSS animations to complete (adjust timeout as needed)
  cy.wait(1000);
});

// Custom command for basic accessibility check
Cypress.Commands.add('checkA11y', () => {
  // Basic accessibility checks
  cy.get('main').should('exist');

  // Check for proper heading structure
  cy.get('h1').should('exist');

  // Check that focusable elements can be reached
  cy.get('button, a, input, select, textarea').each(($el) => {
    if ($el.is(':visible')) {
      cy.wrap($el).should('not.have.attr', 'tabindex', '-1');
    }
  });
});

// Custom command for tab navigation
Cypress.Commands.add('tab', () => {
  cy.get('body').trigger('keydown', { key: 'Tab' });
});

// Type declarations are handled in e2e.ts to avoid duplication

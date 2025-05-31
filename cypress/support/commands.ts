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
  // Visit login page
  cy.visit('/login');

  // Wait for page to load
  cy.waitForPageLoad();

  // Fill in test credentials using the actual form structure
  cy.get('input[type="email"]', { timeout: 10000 })
    .should('be.visible')
    .type('a.altun70@outlook.com');

  cy.get('input[type="password"]').should('be.visible').type('abdullah');

  // Submit login form
  cy.get('button[type="submit"]')
    .contains('Sign in')
    .should('be.visible')
    .click();

  // Wait for redirect to home page
  cy.url().should('not.include', '/login');
  cy.waitForPageLoad();
});

// Custom command to wait for page load
Cypress.Commands.add('waitForPageLoad', () => {
  // Ensure the page is interactive
  cy.document().should('have.property', 'readyState', 'complete');

  // Wait a bit for any dynamic content to load
  cy.wait(500);
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

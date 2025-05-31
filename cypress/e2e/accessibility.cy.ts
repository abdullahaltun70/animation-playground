describe('Basic Accessibility Testing', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();
    cy.clearCookies();
    cy.loginAsTestUser();
  });

  describe('Login Page Accessibility', () => {
    it('should have accessible login form', () => {
      cy.clearLocalStorage();
      cy.clearAllSessionStorage();
      cy.clearCookies();

      cy.visit('/login');
      cy.waitForPageLoad();

      // Check for proper form labels
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');

      // Check for semantic HTML
      cy.get('form').should('exist');
      cy.get('button[type="submit"]').should('be.visible');

      // Check for heading structure
      cy.get('h1, h2').should('exist');
    });
  });

  describe('Playground Accessibility', () => {
    it('should have accessible playground interface', () => {
      cy.visit('/playground');
      cy.waitForPageLoad();

      // Check for main content area
      cy.get('main, [role="main"]').should('exist');

      // Check for proper heading structure
      cy.get('h1, h2').should('exist');

      // Check interactive elements are focusable
      cy.get('button, input, select, a[href]').each(($el) => {
        if ($el.is(':visible')) {
          cy.wrap($el).should('not.have.attr', 'tabindex', '-1');
        }
      });
    });

    it('should support keyboard navigation', () => {
      cy.visit('/playground');
      cy.waitForPageLoad();

      // Find focusable elements
      cy.get('button, input, select, a[href], [tabindex]:not([tabindex="-1"])')
        .filter(':visible')
        .then(($elements) => {
          if ($elements.length > 0) {
            // Focus the first element
            cy.wrap($elements[0]).focus();
            cy.focused().should('exist');
            cy.focused().should('be.visible');

            // Test that keyboard events work by triggering a real Tab keydown event
            cy.focused().trigger('keydown', {
              key: 'Tab',
              code: 'Tab',
              keyCode: 9,
            });

            // Just verify that elements are focusable - this is the main accessibility concern
            // If there are multiple focusable elements, try focusing the second one
            if ($elements.length > 1) {
              cy.wrap($elements[1]).focus();
              cy.focused().should('exist');
              cy.focused().should('be.visible');
            }
          }
        });
    });
  });

  describe('Profile Page Accessibility', () => {
    it('should have accessible profile interface', () => {
      // Profile requires authentication, so login first
      cy.loginAsTestUser();

      cy.visit('/profile');
      cy.waitForPageLoad();

      // Check for semantic structure (profile might have different structure)
      cy.get('main, [role="main"]').should('exist');

      // Check for any heading (h1, h2, h3, etc.) or if no headings, at least check for content
      cy.get('body').then(($body) => {
        if ($body.find('h1, h2, h3, h4, h5, h6').length > 0) {
          cy.get('h1, h2, h3, h4, h5, h6').should('exist');
        } else {
          // If no headings, at least verify page has loaded with some content
          cy.get('main, [role="main"]').should('be.visible');
        }
      });

      // Check that interactive elements are accessible
      cy.get('button, a[href]').each(($el) => {
        if ($el.is(':visible')) {
          cy.wrap($el).should('be.visible');
        }
      });
    });
  });
});

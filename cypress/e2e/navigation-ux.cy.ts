describe('Navigation and User Experience', () => {
  beforeEach(() => {
    // Clear any existing authentication state
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();
    cy.clearCookies();

    // Login before each test
    cy.loginAsTestUser();
  });

  describe('Homepage and Navigation', () => {
    it('should load homepage successfully', () => {
      cy.visit('/');
      cy.waitForPageLoad();

      // Check page title
      cy.title().should('contain', 'Animation Playground');

      // Check main navigation
      cy.get('[data-cy="main-nav"]').should('be.visible');
      cy.get('[data-cy="nav-home"]').should('be.visible');
      cy.get('[data-cy="nav-playground"]').should('be.visible');
      cy.get('[data-cy="nav-documentation"]').should('be.visible');

      // Check call-to-action buttons
      cy.get('[data-cy="animation-preview"]').should('be.visible');
      cy.get('[data-cy="config-panel"]').should('be.visible');

      // Check accessibility
      cy.checkA11y();
    });

    it('should navigate using main navigation menu', () => {
      cy.visit('/');
      cy.waitForPageLoad();

      // Test navigation links
      cy.get('[data-cy="nav-documentation"]').click();
      cy.url().should('include', '/documentation');
      cy.waitForPageLoad();

      cy.get('[data-cy="nav-home"]').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    describe('Header and Footer Navigation', () => {
      beforeEach(() => {
        cy.visit('/');
        cy.waitForPageLoad();
      });

      it('should display and interact with header', () => {
        // Check header elements
        cy.get('[data-cy="main-nav"]').should('be.visible');
        cy.get('[data-cy="nav-home"]').should('be.visible');

        // Check theme toggle
        cy.get('[data-cy="theme-toggle"]').should('be.visible').click();

        cy.get('[data-cy="theme-toggle-dark"]').should('be.visible').click();
        cy.wait(300);
        // Toggle back
        cy.get('[data-cy="theme-toggle"]').should('be.visible').click();

        cy.get('[data-cy="theme-toggle-light"]').click();
      });

      it('should display user menu when logged in', () => {
        cy.loginAsTestUser();
        cy.visit('/');

        // User menu should be visible
        cy.get('[data-cy="user-profile"]').should('be.visible');

        // Click user menu
        cy.get('[data-cy="user-profile"]').click();

        // Menu items should be visible
        cy.get('[data-cy="user-email-label"]').should('be.visible');
        cy.get('[data-cy="user-profile-link"]').should('be.visible');
        cy.get('[data-cy="sign-out-button"]').should('be.visible');
      });

      it('should display login/signup buttons when not logged in', () => {
        // log out to ensure we're not logged in
        cy.get('.rt-AvatarImage').click();
        cy.get('[data-cy="sign-out-button"]').click();

        cy.wait(500); // Wait for logout to complete
        cy.visit('/');

        // Check auth buttons
        cy.get('[data-cy="sign-in-button"]').should('be.visible');
        cy.get('.rt-Flex > :nth-child(2)').should('be.visible');

        // Test login button
        cy.get('[data-cy="sign-in-button"]').click();
        cy.url().should('include', '/login');
      });

      it('should display footer with correct links', () => {
        // Scroll to footer
        cy.get('[data-cy="site-footer"]').scrollIntoView();
        cy.get('[data-cy="site-footer"]').should('be.visible');

        // Check footer sections
        cy.get('[data-cy="footer-terms"]').should('be.visible');
        cy.get('[data-cy="footer-privacy"]').should('be.visible');

        // Test footer links
        cy.get('[data-cy="footer-github"]').should('be.visible');
      });
    });
  });

  describe('Keyboard Navigation and Accessibility', () => {
    it('should support keyboard navigation', () => {
      cy.visit('/');
      cy.waitForPageLoad();

      // Test tab navigation
      cy.press(Cypress.Keyboard.Keys.TAB);
      cy.focused().should('have.attr', 'data-cy', 'nav-home');

      cy.press(Cypress.Keyboard.Keys.TAB);
      cy.focused().should('have.attr', 'data-cy', 'nav-playground');

      cy.press(Cypress.Keyboard.Keys.TAB);
      cy.focused().should('have.attr', 'data-cy', 'nav-documentation');
    });

    it('should have proper focus management in modals', () => {
      cy.loginAsTestUser();
      cy.visit('/playground');
      cy.waitForPageLoad();

      // fill in animation name
      cy.get('[data-cy="animation-name-input"]')
        .focus()
        .clear()
        .type('Accessibility Test Animation');

      // Save animation to enable share button
      // scroll into view and click
      cy.get('[data-cy="save-btn"]').scrollIntoView();
      cy.get('[data-cy="save-btn"]').click();
      cy.wait(1500);

      // Open share modal
      cy.get('[data-cy="share-btn"]').click();

      // Focus should be trapped in modal
      cy.get('[data-cy="share-dialog"]').should('be.visible');

      // Escape should close modal
      cy.get('body').type('{esc}');
      cy.get('[data-cy="share-dialog"]').should('not.exist');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle 404 pages gracefully', () => {
      cy.visit('/error', { failOnStatusCode: false });

      // Should show 404 page
      // text "Sorry, something went wrong" should be visible
      cy.waitForPageLoad();
      cy.url().should('include', '/error');

      cy.get('[data-cy="error-page"]').should('be.visible');
      cy.get('[data-cy="error-title"]').should('contain', '404');
      cy.get('[data-cy="error-message"]').should(
        'contain.text',
        'The page may have been moved, deleted, or the URL might be incorrect.'
      );
      cy.get('[data-cy="home-link"]').should('be.visible');

      // Home link should work
      cy.get('[data-cy="home-link"]').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Performance and Optimization', () => {
    it('should load critical resources quickly', () => {
      // Start performance measurement
      cy.visit('/', {
        onBeforeLoad: (win) => {
          win.performance.mark('start-loading');
        },
      });

      cy.window().then((win) => {
        win.performance.mark('page-loaded');
        win.performance.measure(
          'page-load-time',
          'start-loading',
          'page-loaded'
        );

        const measures = win.performance.getEntriesByType('measure');
        const pageLoadTime = measures.find((m) => m.name === 'page-load-time');

        // Page should load within reasonable time (adjust as needed)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        expect(pageLoadTime.duration).to.be.lessThan(5000);
      });
    });
  });
});

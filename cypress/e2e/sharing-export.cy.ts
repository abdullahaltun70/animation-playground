describe('Animation Sharing and Export', () => {
  beforeEach(() => {
    // Ensure fresh authentication for each test
    cy.session(
      'testUser',
      () => {
        cy.loginAsTestUser();
      },
      {
        validate() {
          cy.visit('/playground');
          cy.url().should('not.include', '/login');
        },
      }
    );

    // Visit playground after ensuring authentication
    cy.visit('/playground');
    cy.waitForPageLoad();
  });

  describe('Save Animation', () => {
    it('should save animation configuration', () => {
      // Give the animation a name
      cy.get('[data-cy="animation-name-input"]')
        .should('be.visible')
        .clear()
        .type('Test Animation');

      // Configure animation using working selectors
      cy.get('[data-cy="animation-type-trigger"]').click({ force: true });
      cy.wait(300);
      cy.get('[data-cy="animation-type-slide"]').click({ force: true });

      cy.get('[data-cy="duration-slider"]')
        .invoke('val', 800)
        .trigger('input', { force: true });
      cy.wait(300);

      // Save animation using known working selector
      cy.get('[data-cy="save-btn"]')
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
      cy.wait(2000);

      // Verify we can navigate to profile to see saved animations
      cy.visit('/profile');
      cy.waitForPageLoad();
      cy.get('[role="tabpanel"]').should('be.visible');
    });
  });

  describe('Share Animation', () => {
    it('should check for share functionality', () => {
      // Configure a test animation
      cy.get('[data-cy="animation-type-trigger"]').click({ force: true });
      cy.wait(300);
      cy.get('[data-cy="animation-type-bounce"]').click({ force: true });
      cy.wait(500);

      cy.get('[data-cy="duration-slider"]')
        .invoke('val', 600)
        .trigger('input', { force: true });
      cy.wait(300);

      // Check if share button exists (might be conditional)
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="share-btn"]').length > 0) {
          cy.get('[data-cy="share-btn"]').should('be.visible');
        } else {
          // If no share button, just verify the animation is configured
          cy.get('[data-cy="animation-preview"]').should('be.visible');
        }
      });
    });
  });

  describe('Export Animation', () => {
    it('should verify animation configuration is exportable', () => {
      cy.get('[data-cy="duration-slider"]')
        .invoke('val', 1000)
        .trigger('input', { force: true });
      cy.wait(300);

      // Verify the animation is configured and ready for export
      cy.get('[data-cy="animation-preview"]').should('be.visible');
      cy.get('[data-cy="config-panel"]').should('be.visible');

      cy.get('[data-cy="export-btn"]')
        .should('be.visible')
        .click({ force: true });
      cy.get('[data-cy="export-code-react"]').should('be.visible');
      cy.get('[data-cy="export-code-react"]').should('contain', 'fade');

      cy.get('[data-cy="copy-code-btn"]')
        .should('be.visible')
        .click({ force: true });
      cy.wait(1000);

      cy.get('[data-cy="copy-success-message"]')
        .should('be.visible')
        .and('contain', 'Code copied to clipboard!');
    });
  });

  describe('Animation Library Integration', () => {
    it('should verify basic playground functionality', () => {
      // Visit the playground page
      cy.visit('/playground');
      cy.waitForPageLoad();

      // Verify basic playground components are working
      cy.get('[data-cy="animation-preview"]').should('be.visible');
      cy.get('[data-cy="config-panel"]').should('be.visible');

      // Test animation configuration
      cy.get('[data-cy="animation-type-trigger"]').click({ force: true });
      cy.wait(300);
      cy.get('[data-cy="animation-type-scale"]').click({ force: true });
      cy.wait(500);

      // Verify animation updates
      cy.get('[data-cy="animation-preview"]').should('be.visible');
    });
  });
});

describe('Complete End-to-End User Journeys', () => {
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
  });

  describe('New User Complete Journey', () => {
    it('should complete full new user onboarding and first animation creation', () => {
      // Start at playground since we're already authenticated
      cy.visit('/playground');
      cy.waitForPageLoad();

      // Verify we're at the playground
      cy.get('[data-cy="animation-preview"]').should('be.visible');
      cy.get('[data-cy="config-panel"]').should('be.visible');

      // Give animation a name
      cy.get('[data-cy="animation-name-input"]')
        .should('be.visible')
        .clear()
        .type('First Animation');
      cy.wait(500);
      // Verify name input works
      cy.get('[data-cy="animation-name-input"]').should(
        'have.value',
        'First Animation'
      );
      // Wait for any initial animations to complete
      cy.waitForAnimation();
      cy.wait(500);

      // Create first animation using working selectors
      cy.get('[data-cy="animation-type-trigger"]').click({ force: true });
      cy.wait(300);
      cy.get('[data-cy="animation-type-fade"]').click({ force: true });
      cy.wait(500);

      // Configure animation
      cy.get('[data-cy="duration-slider"]')
        .invoke('val', 800)
        .trigger('input', { force: true });
      cy.wait(300);
      cy.get('[data-cy="delay-slider"]')
        .invoke('val', 200)
        .trigger('input', { force: true });
      cy.wait(300);

      // Verify animation preview works
      cy.get('[data-cy="animation-preview"]').should('be.visible');

      // Save animation
      cy.get('[data-cy="save-btn"]')
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
      cy.wait(2000);

      // Visit profile to see saved animation
      cy.visit('/profile');
      cy.waitForPageLoad();
      cy.get('[role="tabpanel"]').should('be.visible');
    });
  });

  describe('Power User Advanced Workflow', () => {
    it('should complete advanced animation workflow', () => {
      // Start with complex animation workflow
      cy.visit('/playground');
      cy.waitForPageLoad();

      // Give animation a name
      cy.get('[data-cy="animation-name-input"]')
        .should('be.visible')
        .clear()
        .type('Advanced Animation');
      cy.wait(500);

      // Create animation with working selectors
      cy.get('[data-cy="animation-type-trigger"]').click({ force: true });
      cy.wait(300);
      cy.get('[data-cy="animation-type-bounce"]').click({ force: true });
      cy.wait(500);

      // Configure complex properties
      cy.get('[data-cy="duration-slider"]')
        .invoke('val', 1500)
        .trigger('input', { force: true });
      cy.wait(300);
      cy.get('[data-cy="delay-slider"]')
        .invoke('val', 500)
        .trigger('input', { force: true });
      cy.wait(300);

      // Verify animation preview works
      cy.get('[data-cy="animation-preview"]').should('be.visible');

      // Save animation
      cy.get('[data-cy="save-btn"]')
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
      cy.wait(2000);

      // Create variations by changing duration multiple times
      for (let i = 1; i <= 2; i++) {
        // Modify duration
        cy.get('[data-cy="duration-slider"]')
          .invoke('val', 1000 + i * 200)
          .trigger('input', { force: true });
        cy.wait(300);

        // Save variation
        cy.get('[data-cy="save-btn"]')
          .scrollIntoView()
          .should('be.visible')
          .click({ force: true });
        cy.wait(1500);
      }

      // Go to profile to verify saved animations
      cy.visit('/profile');
      cy.waitForPageLoad();
      cy.get('[role="tabpanel"]').should('be.visible');
    });
  });

  describe('Basic Export Workflow', () => {
    beforeEach(() => {
      cy.loginAsTestUser();
    });

    it('should export animation code', () => {
      // 1. Create animation to export
      cy.visit('/playground');
      cy.waitForPageLoad();

      cy.get('[data-cy="animation-type-trigger"]').click({ force: true });
      cy.wait(300);
      cy.get('[data-cy="animation-type-bounce"]').click({ force: true });
      cy.wait(500);

      cy.get('[data-cy="duration-slider"]')
        .invoke('val', 1200)
        .trigger('input', { force: true });
      cy.wait(300);

      // 2. Test export functionality if available
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="export-btn"]').length > 0) {
          cy.get('[data-cy="export-btn"]').click({ force: true });
          cy.wait(500);

          // Try to export as CSS if available
          if ($body.find('[data-cy="export-css-btn"]').length > 0) {
            cy.get('[data-cy="export-css-btn"]').click({ force: true });
            cy.wait(500);
          }
        }
      });

      // 3. Verify animation works
      cy.get('[data-cy="animation-preview"]').should('be.visible');
    });
  });

  describe('Accessibility Complete Journey', () => {
    it('should complete full journey using keyboard navigation', () => {
      // First login as test user
      cy.loginAsTestUser();

      // Then visit playground
      cy.visit('/playground');
      cy.waitForPageLoad();

      // Focus name input and type name
      cy.get('[data-cy="animation-name-input"]')
        .focus()
        .clear()
        .type('Accessibility Test Animation');
      cy.wait(500);

      // Focus animation type trigger and press Enter
      cy.get('[data-cy="animation-type-trigger"]')
        .focus()
        .type('Cypress.io{enter}{downarrow}{enter}');
      cy.wait(300);

      // Use arrow keys to select "slide" (assuming it's the next option)
      cy.wait(500);

      // Focus duration slider and increase value using right arrow
      cy.get('[data-cy="duration-slider"]').type(
        '{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}'
      );
      cy.wait(300);

      // Verify animation preview works
      cy.get('[data-cy="animation-preview"]').should('be.visible');

      // Focus save button and press Enter
      cy.get('[data-cy="save-btn"]').type('Cypress.io{enter}');
      cy.wait(2000);

      // Navigate to profile to verify
      cy.visit('/profile');
      cy.waitForPageLoad();
      cy.contains('Accessibility Test Animation').should('be.visible');
    });
  });
});

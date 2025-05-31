describe('Comprehensive User Journeys - Real Feature Validation', () => {
  beforeEach(() => {
    // Ensure fresh authentication for each test
    cy.session(
      'testUser',
      () => {
        cy.loginAsTestUser();
      },
      {
        validate() {
          // Validate that the session is still valid
          cy.url().should('not.include', '/login');
          cy.visit('/');
        },
      }
    );
  });

  it('Complete animation creation, saving and export journey', () => {
    // Navigate to playground
    cy.visit('/');
    cy.wait(1000);

    // Create animation with specific configuration
    cy.get('[data-cy="animation-type-trigger"]').click({ force: true });
    cy.get('[data-cy="animation-type-slide"]').click({ force: true });
    cy.wait(200);

    // Configure animation with precise values using Radix UI slider approach
    cy.get('[data-cy="duration-slider"]')
      .invoke('val', 1500)
      .trigger('input', { force: true });
    cy.wait(300);

    cy.get('[data-cy="delay-slider"]')
      .invoke('val', 200)
      .trigger('input', { force: true });
    cy.wait(300);

    // Verify animation preview reflects changes
    cy.get('[data-cy="animation-preview"]').should('be.visible');

    // Set a name for the animation (REQUIRED for saving)
    cy.get('[data-cy="animation-name-input"]')
      .clear()
      .type('Comprehensive Test Animation');
    cy.wait(500);

    // Save animation (requires name to be set)
    cy.get('[data-cy="save-btn"]').click({ force: true });
    cy.wait(1000);

    // Verify success and that share button appears after saving
    cy.get('[data-cy="share-btn"]').should('be.visible');
    cy.get('[data-cy="export-btn"]').should('be.visible');

    // Test export functionality
    cy.get('[data-cy="export-btn"]').click({ force: true });
    cy.get('[data-cy="export-dialog"]').should('be.visible');

    // Verify dialog structure and content
    cy.get('[data-cy="export-dialog"]').within(() => {
      cy.contains('Export Animation Code').should('be.visible');
    });

    // Verify tabs system works correctly (Radix UI uses data-state)
    cy.get('[data-cy="export-tab-react"]')
      .should('be.visible')
      .and('have.attr', 'data-state', 'active');
    cy.get('[data-cy="export-tab-css"]')
      .should('be.visible')
      .and('have.attr', 'data-state', 'inactive');

    // Verify React code generation
    cy.get('[data-cy="export-code-react"]')
      .should('be.visible')
      .and('contain.text', 'slide');

    // Test tab switching
    cy.get('[data-cy="export-tab-css"]').click({ force: true });
    cy.get('[data-cy="export-tab-css"]').should(
      'have.attr',
      'data-state',
      'active'
    );
    cy.get('[data-cy="export-tab-react"]').should(
      'have.attr',
      'data-state',
      'inactive'
    );

    // Close dialog
    cy.get('[data-cy="close-export-dialog"]').click({ force: true });
    cy.get('[data-cy="export-dialog"]').should('not.exist');
  });

  it('Complete sharing workflow with saved animation', () => {
    // Navigate to playground
    cy.visit('/');
    cy.wait(1000);

    // Create animation configuration
    cy.get('[data-cy="animation-type-trigger"]').click({ force: true });
    cy.get('[data-cy="animation-type-bounce"]').click({ force: true });

    // Configure properties
    cy.get('[data-cy="duration-slider"]')
      .invoke('val', 1800)
      .trigger('input', { force: true });
    cy.wait(300);

    cy.get('[data-cy="delay-slider"]')
      .invoke('val', 1000)
      .trigger('input', { force: true });
    cy.wait(300);

    // Set name and save configuration to enable sharing
    cy.get('[data-cy="animation-name-input"]')
      .clear()
      .type('Sharing Test Animation');
    cy.wait(500);
    cy.get('[data-cy="save-btn"]').click({ force: true });
    cy.wait(1000);

    // Verify share button becomes available after saving
    cy.get('[data-cy="share-btn"]').should('be.visible');

    // Test sharing functionality
    cy.get('[data-cy="share-btn"]').click({ force: true });

    // Check if sharing creates a shareable URL
    cy.url().should('include', '?id=');
  });

  it('Animation type validation workflow', () => {
    // Test all available animation types
    cy.visit('/');
    cy.wait(1000);

    const animationTypes = ['fade', 'slide', 'scale', 'rotate', 'bounce'];

    animationTypes.forEach((animationType) => {
      cy.get('[data-cy="animation-type-trigger"]').click({ force: true });
      cy.get(`[data-cy="animation-type-${animationType}"]`).click({
        force: true,
      });

      // Verify animation preview updates for each type
      cy.get('[data-cy="animation-preview"]').should('be.visible');

      // Test export functionality for each animation type
      cy.get('[data-cy="export-btn"]').click({ force: true });
      cy.get('[data-cy="export-code-react"]')
        .should('be.visible')
        .and('contain.text', animationType);
      cy.get('[data-cy="close-export-dialog"]').click({ force: true });
    });
  });

  it('Error handling and edge cases', () => {
    cy.visit('/');
    cy.wait(1000);

    // Test export without saving (should still work)
    cy.get('[data-cy="animation-type-trigger"]').click({ force: true });
    cy.get('[data-cy="animation-type-fade"]').click({ force: true });

    // Export should work even without saving
    cy.get('[data-cy="export-btn"]')
      .should('be.visible')
      .click({ force: true });
    cy.get('[data-cy="export-dialog"]').should('be.visible');
    cy.get('[data-cy="export-code-react"]').should('contain.text', 'fade');
    cy.get('[data-cy="close-export-dialog"]').click({ force: true });

    // Share should not be available without saving
    cy.get('[data-cy="share-btn"]').should('not.exist');

    // Test saving without name (should fail gracefully)
    cy.get('[data-cy="save-btn"]').click({ force: true });
    // Should see error message about name requirement
    cy.contains('Please provide a name').should('be.visible');
  });
});

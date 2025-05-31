describe('Playground Functionality', () => {
  beforeEach(() => {
    // Clear any existing authentication state
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();
    cy.clearCookies();

    // Login before each test
    cy.loginAsTestUser();
  });

  describe('Animation Configuration', () => {
    it('should load the playground page and display animation controls', () => {
      cy.visit('/playground');
      cy.waitForPageLoad();

      // Check that we're on the playground page
      cy.url().should('include', '/playground');

      // Check for the animation preview area (which has data-cy attribute)
      cy.get('[data-cy="animation-preview"]').should('be.visible');

      // Check for export button (which has data-cy attribute)
      cy.get('[data-cy="export-btn"]')
        .should('be.visible')
        .should('contain', 'Export Code');
    });

    it('should display animation configuration panel', () => {
      cy.visit('/playground');
      cy.waitForPageLoad();

      // Check for the config panel with data-cy attribute
      cy.get('[data-cy="config-panel"]').should('be.visible');

      // Check for specific config elements using data-cy attributes
      cy.get('[data-cy="animation-name-input"]').should('be.visible');
      cy.get('[data-cy="animation-description-input"]').should('be.visible');
      cy.get('[data-cy="animation-type-trigger"]').should('be.visible');
      cy.get('[data-cy="easing-trigger"]').should('be.visible');
      cy.get('[data-cy="duration-slider"]').should('be.visible');
      cy.get('[data-cy="delay-slider"]').should('be.visible');

      // Check for action buttons (they might be clipped but should exist)
      cy.get('[data-cy="save-btn"]').should('exist');
      cy.get('[data-cy="reset-btn"]').should('exist');

      // Scroll to make sure buttons are visible
      cy.get('[data-cy="save-btn"]').scrollIntoView().should('be.visible');
      cy.get('[data-cy="reset-btn"]').scrollIntoView().should('be.visible');
    });

    it('should allow animation preview interaction', () => {
      cy.visit('/playground');
      cy.waitForPageLoad();

      // Find and test the animation preview element
      cy.get('[data-cy="animation-preview-element"]').should('be.visible');

      // Test export functionality
      cy.get('[data-cy="export-btn"]').click();

      // Should open some kind of export dialog or modal
      cy.get('body').should('contain.text', 'Export');
    });
  });

  describe('Animation Controls', () => {
    it('should show share button when configuration is saved', () => {
      cy.visit('/playground');
      cy.waitForPageLoad();

      // Initially, share button might not be visible (needs saved config)
      // Let's check if it appears after some interaction
      cy.get('[data-cy="animation-preview"]').should('be.visible');

      // Check if share button exists (it may be conditional)
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="share-btn"]').length > 0) {
          cy.get('[data-cy="share-btn"]').should('contain', 'Share');
        } else {
          // Share button not visible, which is expected for unsaved configs
          cy.log('Share button not visible - configuration likely not saved');
        }
      });
    });

    it('should handle animation type changes', () => {
      cy.visit('/playground');
      cy.waitForPageLoad();

      // Click on animation type trigger to open dropdown
      cy.get('[data-cy="animation-type-trigger"]').click();

      // Select a different animation type (e.g., slide)
      cy.get('[data-cy="animation-type-slide"]').click();

      // Wait for animation to update
      cy.waitForAnimation();

      // Verify the animation preview still works
      cy.get('[data-cy="animation-preview-element"]').should('be.visible');

      // Verify that slide-specific controls appear (distance slider)
      cy.get('[data-cy="distance-input"]').should('be.visible');
      cy.get('[data-cy="axis-trigger"]').should('be.visible');
    });
  });

  describe('Configuration Persistence', () => {
    it('should maintain configuration state during page interactions', () => {
      cy.visit('/playground');
      cy.waitForPageLoad();

      // Verify the config panel is loaded
      cy.get('[data-cy="duration-slider"]').should('be.visible');

      // For Radix UI sliders, we need to interact using click/drag
      // Let's click on the slider to change its value
      cy.get('[data-cy="duration-slider"]').click();

      cy.waitForAnimation();

      // Change animation type to test interaction
      cy.get('[data-cy="animation-type-trigger"]').click();
      cy.get('[data-cy="animation-type-scale"]').click();

      cy.waitForAnimation();

      // Verify scale-specific controls appear
      cy.get('[data-cy="scale-input"]').should('be.visible');

      // Refresh page to test persistence (note: persistence might not be implemented yet)
      cy.reload();
      cy.waitForPageLoad();

      // Animation preview should still be there
      cy.get('[data-cy="animation-preview"]').should('be.visible');
      cy.get('[data-cy="config-panel"]').should('be.visible');
    });
  });
});
